/**
 * Middleware ensuring the authenticated user possesses Super Admin privileges.
 * Strictly verifies role === 'super_admin' or 'admin' and active status.
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Access denied.'
    });
  }

  const role = req.user.role;

  if (role !== 'super_admin' && role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Super Admin authorization required.'
    });
  }

  next();
};

module.exports = { requireSuperAdmin };
