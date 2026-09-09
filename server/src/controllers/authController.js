const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
    name: user.name
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'guardianx_super_secret_jwt_access_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'guardianx_super_secret_jwt_refresh_key_2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/register (Parent registration creates new Tenant)
exports.register = async (req, res) => {
  try {
    const { name, email, password, familyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // 1. Create Tenant (Family)
    const Subscription = require('../models/Subscription');
    const Plan = require('../models/Plan');

    const defaultPlan = await Plan.findOne({ slug: 'free' });

    const tenant = await Tenant.create({
      name: familyName || `${name}'s Family`,
      plan: 'FREE',
      planId: defaultPlan ? defaultPlan._id : null,
      childrenLimit: defaultPlan?.limits?.maxChildren || 1
    });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create Parent User (STRICTLY role: 'parent')
    const user = await User.create({
      tenantId: tenant._id,
      role: 'parent',
      name,
      email: email.toLowerCase(),
      passwordHash
    });

    // 4. Set Tenant ownerId & Subscription
    tenant.ownerId = user._id;

    if (defaultPlan) {
      const subscription = await Subscription.create({
        tenantId: tenant._id,
        parentId: user._id,
        planId: defaultPlan._id,
        status: 'active',
        startDate: new Date()
      });
      tenant.subscriptionId = subscription._id;
    }
    await tenant.save();

    const { accessToken, refreshToken } = generateTokens(user);

    return res.status(201).json({
      success: true,
      message: 'Parent registered successfully.',
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        tenantId: user.tenantId,
        role: user.role,
        name: user.name,
        email: user.email
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        plan: tenant.plan,
        childrenLimit: tenant.childrenLimit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    const tenant = await Tenant.findById(user.tenantId);

    const { accessToken, refreshToken } = generateTokens(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        tenantId: user.tenantId,
        role: user.role,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      tenant: tenant
        ? {
            id: tenant._id,
            name: tenant.name,
            plan: tenant.plan,
            childrenLimit: tenant.childrenLimit
          }
        : null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message
    });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'guardianx_super_secret_jwt_refresh_key_2026'
    );

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or inactive user.'
      });
    }

    const tokens = generateTokens(user);

    return res.status(200).json({
      success: true,
      tokens
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token.'
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// GET /api/auth/me
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    const tenant = await Tenant.findById(req.tenantId);

    return res.status(200).json({
      success: true,
      user,
      tenant
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile.',
      error: error.message
    });
  }
};
