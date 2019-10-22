const express = require('express');
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/signup', authController.showSignUpPage);
router.get('/login', authMiddleware, authController.showLoginPage);
router.get('/logout', authController.logout);
router.get('/forgot-password', authController.forgotPasswordPage);
router.get('/reset-password/:token', authController.passwordResetPage);

router.post('/signup', authController.registerNewUser);
router.post('/login', authController.login);
router.post('/forgot-password', authController.postForgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;