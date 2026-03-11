const express   = require('express')
const router    = express.Router()
const userCtrl  = require('../controllers/userController')
const testCtrl  = require('../controllers/testController')
const dashCtrl  = require('../controllers/dashboardController')
const caCtrl    = require('../controllers/collegeAdminController')
const auth      = require('../middleware/authMiddleware')
const { roleMiddleware, requireMinRole } = require('../middleware/roleMiddleware') // ← named import

// ── User profile ──────────────────────────────────────────
router.get('/users/profile', auth, userCtrl.getUserProfile)
router.put('/users/profile', auth, userCtrl.updateUserProfile)

// ── Analytics ─────────────────────────────────────────────
router.get('/analytics/overview', auth, requireMinRole('COLLEGE_ADMIN'), dashCtrl.getAnalyticsOverview)
router.get('/analytics/students', auth, requireMinRole('COLLEGE_ADMIN'), dashCtrl.getStudentAnalytics)
router.get('/analytics/college',  auth, requireMinRole('COLLEGE_ADMIN'), caCtrl.getCollegeAnalytics)

// ── College admin's own college ───────────────────────────
router.get('/my-college', auth, roleMiddleware('COLLEGE_ADMIN'), caCtrl.getMyCollege)

// ── Student management by college admin ──────────────────
router.get('/college/students',              auth, requireMinRole('COLLEGE_ADMIN'), caCtrl.getCollegeStudents)
router.post('/college/students/onboard',     auth, requireMinRole('COLLEGE_ADMIN'), caCtrl.onboardStudent)
router.post('/college/students/bulk',        auth, requireMinRole('COLLEGE_ADMIN'), caCtrl.bulkOnboardStudents)
router.patch('/college/students/:id/status', auth, requireMinRole('COLLEGE_ADMIN'), caCtrl.updateStudentStatus)

// ── Tests — specific routes BEFORE :id ───────────────────
router.post('/tests/run',                              auth,                               testCtrl.runCode)
router.get('/tests/student/:studentId/results',        auth,                               testCtrl.getStudentTestResults)
router.get('/tests',                                   auth,                               testCtrl.getAllTests)
router.post('/tests',                                  auth, requireMinRole('COLLEGE_ADMIN'), testCtrl.createTest)
router.get('/tests/:id',                               auth,                               testCtrl.getTestById)
router.put('/tests/:id',                               auth, requireMinRole('COLLEGE_ADMIN'), testCtrl.updateTest)
router.delete('/tests/:id',                            auth, requireMinRole('COLLEGE_ADMIN'), testCtrl.deleteTest)
router.get('/tests/:id/submissions',                   auth, requireMinRole('COLLEGE_ADMIN'), testCtrl.getTestSubmissions)
router.get('/tests/:id/leaderboard',                   auth,                               testCtrl.getTestLeaderboard)
router.post('/tests/:id/questions/:questionId/submit', auth,                               testCtrl.submitSolution)

module.exports = router
