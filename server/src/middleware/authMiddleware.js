const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'guardianx_super_secret_jwt_access_key_2026'
    );

    // Fetch user to verify active status
    const dbUser = await User.findById(decoded.id).select('_id role isActive tenantId email name');
    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user account no longer exists.'
      });
    }

    if (!dbUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended or deactivated. Contact Super Admin for assistance.'
      });
    }

    // Verify tenant status if user belongs to a tenant
    if (dbUser.tenantId) {
      const tenant = await Tenant.findById(dbUser.tenantId).select('status');
      if (tenant && tenant.status === 'suspended' && dbUser.role !== 'super_admin' && dbUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Family account is currently suspended. Access denied.'
        });
      }
    }

    req.user = {
      ...decoded,
      id: dbUser._id.toString(),
      _id: dbUser._id,
      tenantId: dbUser.tenantId ? dbUser.tenantId.toString() : null,
      role: dbUser.role,
      email: dbUser.email,
      name: dbUser.name,
      childId: decoded.childId || undefined
    };
    req.tenantId = dbUser.tenantId ? dbUser.tenantId.toString() : null;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
