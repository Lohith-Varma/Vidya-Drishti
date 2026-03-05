const express = require('express')
const router = express.Router()
const collegeController = require('../controllers/collegeController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.use(authMiddleware)

router.get('/',     collegeController.getColleges)
router.get('/:id',  collegeController.getCollegeById)
router.post('/',    roleMiddleware('admin'), collegeController.createCollege)
router.put('/:id',  roleMiddleware('admin'), collegeController.updateCollege)

module.exports = router
