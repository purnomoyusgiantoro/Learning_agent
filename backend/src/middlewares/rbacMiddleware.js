/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {string|string[]} roles 
 */
function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return function rbacMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Autentikasi diperlukan sebelum pemeriksaan otorisasi'
      });
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Peran '${userRole}' tidak memiliki izin untuk tindakan ini. Diperlukan peran: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireAdmin: requireRole('admin'),
  requireManager: requireRole(['admin', 'agent_manager'])
};
