const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { validateRegister, validateForgotPassword, validateResetPassword } = require('../middlewares/validationMiddleware');

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
  successRedirect: '/inicial',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Rota de registro (GET)
router.get('/register', authController.showRegistrationForm);

// Rota de registro (POST) com validação
router.post('/register', validateRegister, authController.register);

// 🔓 Rota para logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return next(err); // redireciona para erro
    }

    // ⚠️ Chama req.flash ANTES de destruir a sessão
    req.flash('success_msg', 'Você saiu com sucesso!');

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/'); // ou /inicial, dependendo do fluxo
    });
  });
});


// Rotas para recuperação de senha
router.get('/forgot-password', authController.showForgotPasswordForm);
router.post('/forgot-password', validateForgotPassword, authController.sendPasswordResetLink);

// Rotas para redefinição de senha
router.get('/reset-password/:token', authController.showResetPasswordForm);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// Rotas para perfil
router.get('/auth/perfil', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'Você precisa estar logada para acessar o perfil');
    return res.redirect('/auth/login');
  }

  res.render('perfil', {
    title: 'Meu Perfil',
    user: req.user
  });
});


module.exports = router;