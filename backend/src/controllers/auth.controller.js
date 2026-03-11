const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../prismaClient')
const { userSelectPublic } = require('../models/User')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' })
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated. Contact your admin.' })

    // Role validation
    if (role) {
      const expectedRole = role.toUpperCase().replace(' ', '_')
      if (user.role !== expectedRole) {
        const label = {
          PLATFORM_ADMIN: 'Platform Admin',
          COLLEGE_ADMIN:  'College Admin',
          STUDENT:        'Student'
        }[user.role] || user.role
        return res.status(401).json({ message: `This account is a ${label} account.` })
      }
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' })

    const token = generateToken(user.id)

    // Attach college info if applicable
    let userWithCollege = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        ...userSelectPublic,
        college: { select: { id: true, name: true, code: true } }
      }
    })

    res.json({ message: 'Login successful', token, user: userWithCollege })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error during login.' })
  }
}

// POST /api/auth/register (for self-registration — students only)
const register = async (req, res) => {
  try {
    const { email, password, name, rollNumber, department, year, collegeId } = req.body
    if (!email || !password || !name) return res.status(400).json({ message: 'Name, email and password required.' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ message: 'Email already registered.' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email, name, password: hashed,
        role: 'STUDENT',
        rollNumber: rollNumber || null,
        department: department || null,
        year: year || null,
        collegeId: collegeId || null,
      },
      select: userSelectPublic
    })

    const token = generateToken(user.id)
    res.status(201).json({ message: 'Registration successful', token, user })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Roll number or email already exists.' })
    res.status(500).json({ message: 'Registration failed.' })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        ...userSelectPublic,
        college: { select: { id: true, name: true, code: true } }
      }
    })
    res.json(user)
  } catch { res.status(500).json({ message: 'Failed to fetch user.' }) }
}

const logout = (req, res) => res.json({ message: 'Logged out successfully.' })

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required.' })
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' })

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' })

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })
    res.json({ message: 'Password changed successfully.' })
  } catch { res.status(500).json({ message: 'Failed to change password.' }) }
}

module.exports = { login, register, getMe, logout, changePassword }
