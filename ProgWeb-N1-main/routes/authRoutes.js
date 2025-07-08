const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { validateRegister } = require('../middlewares/validationMiddleware');

// Rota de login (GET)
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login - Lumina Edu',
    layout: 'layout-login',
    csrfToken: req.csrfToken()  // Adiciona proteção CSRF
  });
});

// Rota de login (POST)
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Rota de registro (GET)
router.get('/register', authController.showRegistrationForm);

// Rota de registro (POST) com validação
router.post('/register', validateRegister, authController.register);

// Rota de logout
router.get('/logout', authController.logout);

module.exports = router;