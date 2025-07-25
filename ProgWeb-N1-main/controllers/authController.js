const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Controllers para autenticação
exports.showLoginForm = (req, res) => {
  res.render('auth/login', {
    title: 'Login - Lumina Edu',
    csrfToken: req.csrfToken(),
    error_msg: req.flash('error')[0]
  });
};

exports.showRegistrationForm = (req, res) => {
  res.render('auth/register', {
    title: 'Cadastro - Lumina Edu',
    csrfToken: req.csrfToken(),
    error_msg: req.flash('error_msg')
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('error_msg', 'As senhas não coincidem');
      return res.redirect('/auth/register');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error_msg', 'E-mail já cadastrado');
      return res.redirect('/auth/register');
    }

    const user = await User.create({ name, email, password });

    req.login(user, (err) => {
      if (err) {
        console.error('Erro no login automático:', err);
        req.flash('success_msg', 'Cadastro realizado! Faça login para continuar');
        return res.redirect('/auth/login');
      }
      req.flash('success_msg', 'Cadastro realizado com sucesso!');
      return res.redirect('/inicial');
    });

  } catch (err) {
    console.error('Erro no registro:', err);
    req.flash('error_msg', 'Erro durante o cadastro');
    res.redirect('/auth/register');
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.redirect('/');
    }
    req.flash('success_msg', 'Logout realizado com sucesso');
    res.redirect('/auth/login');
  });
};

// Controllers para recuperação de senha
exports.showForgotPasswordForm = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Recuperar Senha - Lumina Edu',
    csrfToken: req.csrfToken(),
    error_msg: req.flash('error_msg'),
    info_msg: req.flash('info_msg')
  });
};

exports.sendPasswordResetLink = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      req.flash('info_msg', 'Se o e-mail existir, enviaremos um link de recuperação');
      return res.redirect('/auth/forgot-password');
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hora
    await user.save({ validateBeforeSave: false });

    await emailService.sendPasswordResetEmail(user.email, token);

    req.flash('success_msg', 'Um e-mail com instruções foi enviado');
    res.redirect('/auth/login');

  } catch (err) {
    console.error('Erro ao enviar link de recuperação:', err);
    req.flash('error_msg', 'Erro ao processar solicitação');
    res.redirect('/auth/forgot-password');
  }
};

exports.showResetPasswordForm = async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error_msg', 'Token inválido ou expirado');
      return res.redirect('/auth/forgot-password');
    }

    res.render('auth/reset-password', {
      title: 'Redefinir Senha - Lumina Edu',
      csrfToken: req.csrfToken(),
      token: req.params.token,
      error_msg: req.flash('error')[0]
    });

  } catch (err) {
    console.error('Erro ao verificar token:', err);
    req.flash('error_msg', 'Erro ao processar solicitação');
    res.redirect('/auth/forgot-password');
  }
};

exports.resetPassword = async (req, res) => {
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

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    await emailService.sendPasswordChangedConfirmation(user.email);

    req.flash('success_msg', 'Senha alterada com sucesso!');
    res.redirect('/auth/login');

  } catch (err) {
    console.error('Erro ao resetar senha:', err);
    req.flash('error_msg', 'Ocorreu um erro ao redefinir a senha');
    res.redirect(`/auth/reset-password/${req.params.token}`);
  }
};

// Controller para perfil
exports.showProfile = (req, res) => {
  res.render('auth/perfil', {
    title: 'Meu Perfil - Lumina Edu',
    user: req.user
  });
};