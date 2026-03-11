const ROLE_LEVELS = {
  PLATFORM_ADMIN: 3,
  COLLEGE_ADMIN:  2,
  STUDENT:        1,
}

// Exact role match
const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required.' })
  const role    = req.user.role?.toUpperCase()
  const allowed = allowedRoles.map(r => r.toUpperCase())
  if (!allowed.includes(role)) {
    return res.status(403).json({ message: `Access denied. Required: ${allowedRoles.join(' or ')}` })
  }
  next()
}

// Minimum role level (PLATFORM_ADMIN passes any COLLEGE_ADMIN check too)
const requireMinRole = (minRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required.' })
  const userLevel = ROLE_LEVELS[req.user.role?.toUpperCase()] || 0
  const minLevel  = ROLE_LEVELS[minRole.toUpperCase()] || 0
  if (userLevel < minLevel) {
    return res.status(403).json({ message: `Access denied. Minimum role required: ${minRole}` })
  }
  next()
}

// College scope guard
const collegeScope = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication required.' })
  if (req.user.role?.toUpperCase() === 'PLATFORM_ADMIN') return next()
  if (!req.user.collegeId) {
    return res.status(403).json({ message: 'User is not assigned to any college.' })
  }
  next()
}

// ── IMPORTANT: named exports, NOT module.exports = function ──
module.exports = { roleMiddleware, requireMinRole, collegeScope }
