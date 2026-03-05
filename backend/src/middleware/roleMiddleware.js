const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const userRole = req.user.role.toUpperCase()
    const allowed = allowedRoles.map(r => r.toUpperCase())

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      })
    }
    next()
  }
}

module.exports = roleMiddleware
