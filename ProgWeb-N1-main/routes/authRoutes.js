const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { 
  validateRegister, 
  validateForgotPassword, 
  validateResetPassword 
} = require('../middlewares/validationMiddleware');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Rotas de autenticação
router.get('/login', authController.showLoginForm);

router.post('/login', passport.authenticate('local', {
  successRedirect: '/inicial',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Rotas de registro
router.get('/register', authController.showRegistrationForm);
router.post('/register', validateRegister, authController.register);

// Rota de logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'Logout realizado com sucesso');
    res.redirect('/auth/login');
  });
});

// Rotas de recuperação de senha
router.get('/forgot-password', authController.showForgotPasswordForm);

router.post('/forgot-password', validateForgotPassword, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      req.flash('info_msg', 'Se o e-mail existir, enviaremos um link de recuperação');
      return res.redirect('/auth/forgot-password');
    }

    // Gera token e data de expiração (1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, token);

    req.flash('success_msg', 'Um e-mail com instruções foi enviado');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Erro no forgot-password:', error);
    req.flash('error_msg', 'Erro ao processar solicitação');
    res.redirect('/auth/forgot-password');
  }
});

// Rotas de redefinição de senha
router.get('/reset-password/:token', authController.showResetPasswordForm);

router.post('/reset-password/:token', validateResetPassword, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;

    if (newPassword !== confirmPassword) {
      req.flash('error', 'As senhas não coincidem');
      return res.redirect(`/auth/reset-password/${token}`);
    }

    const user = await User.findOne({ 
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error_msg', 'Token inválido ou expirado');
      return res.redirect('/auth/forgot-password');
    }

    // Atualiza a senha
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    await emailService.sendPasswordChangedConfirmation(user.email);

    req.flash('success_msg', 'Senha alterada com sucesso!');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    req.flash('error_msg', 'Ocorreu um erro ao redefinir a senha');
    res.redirect(`/auth/reset-password/${req.params.token}`);
  }
});

// Rota de perfil (protegida)
router.get('/perfil', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'Você precisa estar logado para acessar o perfil');
    return res.redirect('/auth/login');
  }
  res.render('auth/perfil', {
    title: 'Meu Perfil',
    user: req.user
  });
});

module.exports = router;