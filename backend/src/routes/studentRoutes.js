const express = require('express')
const router = express.Router()
const studentController = require('../controllers/studentController')
const adminController = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

// All routes require authentication
router.use(authMiddleware)

// Student/Admin shared routes
router.get('/search',           studentController.searchStudents)
router.get('/leaderboard',      studentController.getLeaderboard)
router.get('/',                 roleMiddleware('admin'), studentController.getAllStudents)
router.get('/:id',              studentController.getStudentById)
router.get('/:id/stats',        studentController.getStudentStats)
router.get('/:id/submissions',  studentController.getStudentSubmissions)
router.put('/:id',              studentController.updateStudent)

module.exports = router
