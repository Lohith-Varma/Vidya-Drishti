const express = require('express')
const router = express.Router()

// Sub-routers
const authRoutes    = require('../src/routes/authRoutes')
const studentRoutes = require('../src/routes/studentRoutes')
const adminRoutes   = require('../src/routes/adminRoutes')
const collegeRoutes = require('../src/routes/collegeRoutes')
const leetcodeRoute  = require('./leetcode')
const hackerrankRoute = require('./hackerrank')

// Mount all routes
router.use('/auth',                   authRoutes)
router.use('/students',               studentRoutes)
router.use('/colleges',               collegeRoutes)
router.use('/integrations/leetcode',  leetcodeRoute)
router.use('/integrations/hackerrank',hackerrankRoute)

// Admin + shared routes (users, tests, analytics) 
router.use('/',                       adminRoutes)

// API info
router.get('/', (req, res) => res.json({
  name: 'Vidya-Drishti API',
  version: '1.0.0',
  endpoints: [
    'POST /api/auth/login',
    'POST /api/auth/register',
    'GET  /api/auth/me',
    'GET  /api/students',
    'GET  /api/students/leaderboard',
    'GET  /api/tests',
    'POST /api/tests',
    'POST /api/tests/run',
    'GET  /api/integrations/leetcode/:username',
    'GET  /api/integrations/hackerrank/:username',
    'GET  /api/analytics/overview',
  ]
}))

module.exports = router
