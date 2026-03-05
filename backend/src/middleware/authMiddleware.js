const jwt = require('jsonwebtoken')
const prisma = require('../prismaClient')

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Access denied.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, email: true, name: true, role: true,
        rollNumber: true, employeeId: true, department: true,
        leetcodeHandle: true, hackerrankHandle: true, avatar: true,
      }
    })

    if (!user) return res.status(401).json({ message: 'User not found. Token invalid.' })

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' })
    }
    return res.status(500).json({ message: 'Authentication error.' })
  }
}

module.exports = authMiddleware
