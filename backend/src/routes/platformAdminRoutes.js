const express  = require('express')
const router   = express.Router()
const ctrl     = require('../controllers/platformAdminController')
const auth     = require('../middleware/authMiddleware')
const { roleMiddleware } = require('../middleware/roleMiddleware') // ← named import

const isPlatform = roleMiddleware('PLATFORM_ADMIN')

router.use(auth, isPlatform)

// Overview & Analytics
router.get('/overview',  ctrl.getOverview)
router.get('/analytics', ctrl.getPlatformAnalytics)

// Colleges
router.get('/colleges',        ctrl.getColleges)
router.post('/colleges',       ctrl.createCollege)
router.put('/colleges/:id',    ctrl.updateCollege)
router.delete('/colleges/:id', ctrl.deleteCollege)

// College Admins
router.get('/admins',                       ctrl.getCollegeAdmins)
router.post('/admins',                      ctrl.createCollegeAdmin)
router.put('/admins/:id',                   ctrl.updateCollegeAdmin)
router.delete('/admins/:id',               ctrl.deleteCollegeAdmin)
router.post('/admins/:id/reset-password',  ctrl.resetAdminPassword)

// All Students
router.get('/students',              ctrl.getAllStudents)
router.patch('/students/:id/toggle', ctrl.toggleStudentStatus)

module.exports = router
