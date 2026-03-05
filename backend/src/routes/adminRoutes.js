const express         = require('express')
const router          = express.Router()
const userController  = require('../controllers/userController')
const testController  = require('../controllers/testController')
const dashController  = require('../controllers/dashboardController')
const auth            = require('../middleware/authMiddleware')
const role            = require('../middleware/roleMiddleware')

// Verify all handlers are properly loaded at startup
const checkHandlers = () => {
  const handlers = {
    'userController.getUserProfile':        userController.getUserProfile,
    'userController.updateUserProfile':     userController.updateUserProfile,
    'testController.getAllTests':            testController.getAllTests,
    'testController.createTest':            testController.createTest,
    'testController.getTestById':           testController.getTestById,
    'testController.runCode':               testController.runCode,
    'testController.submitSolution':        testController.submitSolution,
    'testController.getStudentTestResults': testController.getStudentTestResults,
  }
  const missing = Object.entries(handlers)
    .filter(([, fn]) => typeof fn !== 'function')
    .map(([name]) => name)

  if (missing.length > 0) {
    console.error('❌ Missing controller functions:', missing)
    throw new Error(`Controller functions undefined: ${missing.join(', ')}`)
  }
  console.log('✅ All admin route handlers loaded successfully')
}
checkHandlers()

// ── User profile (any authenticated user) ────────────────
router.get('/users/profile', auth, userController.getUserProfile)
router.put('/users/profile', auth, userController.updateUserProfile)

// ── Analytics (admin only) ────────────────────────────────
router.get('/analytics/overview', auth, role('ADMIN'), dashController.getAnalyticsOverview)
router.get('/analytics/students', auth, role('ADMIN'), dashController.getStudentAnalytics)

// ── Tests — specific routes BEFORE parameterised :id ─────
router.post('/tests/run',                       auth,              testController.runCode)
router.get('/tests/student/:studentId/results', auth,              testController.getStudentTestResults)
router.get('/tests',                            auth,              testController.getAllTests)
router.post('/tests',                           auth, role('ADMIN'), testController.createTest)
router.get('/tests/:id',                        auth,              testController.getTestById)
router.put('/tests/:id',                        auth, role('ADMIN'), testController.updateTest)
router.delete('/tests/:id',                     auth, role('ADMIN'), testController.deleteTest)
router.get('/tests/:id/submissions',            auth, role('ADMIN'), testController.getTestSubmissions)
router.get('/tests/:id/leaderboard',            auth,              testController.getTestLeaderboard)
router.post('/tests/:id/questions/:questionId/submit', auth,       testController.submitSolution)

module.exports = router
