const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prismaClient')
const { userSelectPublic } = require('../models/User')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' })

    // Role check
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(401).json({ message: `This account is not registered as ${role}.` })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' })

    const token = generateToken(user.id)

    // Return user without password
    const { password: _, ...safeUser } = user
    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login.' })
  }
}

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      email, password, name, role = 'student',
      rollNumber, department, year, employeeId, collegeId
    } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ message: 'Email already registered.' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email, name,
        password: hashedPassword,
        role: role.toUpperCase(),
        rollNumber: rollNumber || null,
        department: department || null,
        year: year || null,
        employeeId: employeeId || null,
        collegeId: collegeId || null,
      },
      select: userSelectPublic
    })

    const token = generateToken(user.id)
    res.status(201).json({ message: 'Registration successful', token, user })
  } catch (error) {
    console.error('Register error:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Roll number or email already exists.' })
    }
    res.status(500).json({ message: 'Server error during registration.' })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelectPublic
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user.' })
  }
}

// POST /api/auth/logout
const logout = (req, res) => {
  // JWT is stateless — client deletes token
  res.json({ message: 'Logged out successfully.' })
}

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' })

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })
    res.json({ message: 'Password changed successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password.' })
  }
}

module.exports = { login, register, getMe, logout, changePassword }
