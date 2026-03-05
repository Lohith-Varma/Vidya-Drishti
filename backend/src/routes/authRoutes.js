const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login',           authController.login)
router.post('/register',        authController.register)
router.post('/logout',          authMiddleware, authController.logout)
router.get('/me',               authMiddleware, authController.getMe)
router.put('/change-password',  authMiddleware, authController.changePassword)

module.exports = router
