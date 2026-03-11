const express = require('express')
const router  = express.Router()

const authRoutes           = require('../src/routes/authRoutes')
const studentRoutes        = require('../src/routes/studentRoutes')
const collegeRoutes        = require('../src/routes/collegeRoutes')
const adminRoutes          = require('../src/routes/adminRoutes')
const platformAdminRoutes  = require('../src/routes/platformAdminRoutes')
const leetcodeRoute        = require('./leetcode')
const hackerrankRoute      = require('./hackerrank')

router.use('/auth',                   authRoutes)
router.use('/students',               studentRoutes)
router.use('/colleges',               collegeRoutes)
router.use('/platform',               platformAdminRoutes)
router.use('/integrations/leetcode',  leetcodeRoute)
router.use('/integrations/hackerrank',hackerrankRoute)
router.use('/',                       adminRoutes)

router.get('/', (req, res) => res.json({ name: 'Vidya-Drishti API v2', roles: ['PLATFORM_ADMIN','COLLEGE_ADMIN','STUDENT'] }))

module.exports = router
