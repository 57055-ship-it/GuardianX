const tenantIsolationMiddleware = (req, res, next) => {
  if (!req.tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Tenant context missing. Multi-tenant security violation.'
    });
  }
  next();
};

module.exports = tenantIsolationMiddleware;
