const express = require('express')
const router  = express.Router()
const collegeController          = require('../controllers/collegeController')
const authMiddleware             = require('../middleware/authMiddleware')
const { requireMinRole }         = require('../middleware/roleMiddleware') // ← named import

router.use(authMiddleware)

router.get('/',     collegeController.getColleges)
router.get('/:id',  collegeController.getCollegeById)
router.post('/',    requireMinRole('COLLEGE_ADMIN'), collegeController.createCollege)
router.put('/:id',  requireMinRole('COLLEGE_ADMIN'), collegeController.updateCollege)

module.exports = router
