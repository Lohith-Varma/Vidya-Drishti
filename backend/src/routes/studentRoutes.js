const express = require('express')
const router  = express.Router()
const studentController = require('../controllers/studentController')
const authMiddleware    = require('../middleware/authMiddleware')
const { roleMiddleware, requireMinRole } = require('../middleware/roleMiddleware') // ← named import

router.use(authMiddleware)

router.get('/search',          studentController.searchStudents)
router.get('/leaderboard',     studentController.getLeaderboard)
router.get('/',                requireMinRole('COLLEGE_ADMIN'), studentController.getAllStudents)
router.get('/:id',             studentController.getStudentById)
router.get('/:id/stats',       studentController.getStudentStats)
router.get('/:id/submissions', studentController.getStudentSubmissions)
router.put('/:id',             studentController.updateStudent)

module.exports = router
