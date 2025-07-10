const crypto = require('crypto');
const User = require('../models/User');
// Certifique-se de importar o serviço de e-mail
const { sendPasswordResetEmail, sendPasswordChangedConfirmation } = require('../services/emailService');

exports.showRegistrationForm = (req, res) => {
  res.render('register', {
    title: 'Cadastro - Lumina Edu',
    csrfToken: req.csrfToken()
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error_msg', 'E-mail já cadastrado');
      return res.redirect('/auth/register');
    }

    const user = await User.create({ name, email, password });

    req.login(user, (err) => {
      if (err) throw err;
      req.flash('success_msg', 'Cadastro realizado com sucesso!');
      res.redirect('/dashboard');
    });

  } catch (err) {
    console.error('Erro no registro:', err);
    req.flash('error_msg', 'Erro durante o cadastro');
    res.redirect('/auth/register');
  }
};

exports.logout = (req, res) => {
  req.logout(() => {
    req.flash('success_msg', 'Você saiu da sua conta');
    res.redirect('/');
  });
};

// Exibe formulário para o usuário digitar o email
exports.showForgotPasswordForm = (req, res) => {
  res.render('forgot-password', {
    title: 'Recuperar Senha - Lumina Edu',
    csrfToken: req.csrfToken(),
    token: '',     // Evita erro no EJS
    email: ''      // Evita erro no EJS
  });
};

// Processa envio do email de recuperação
exports.sendPasswordResetLink = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      req.flash('error_msg', 'Se um usuário com este e-mail existir, um link de recuperação será enviado');
      return res.redirect('/auth/forgot-password');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    await sendPasswordResetEmail(user.email, token);

    req.flash('success_msg', 'Um e-mail com instruções para redefinir sua senha foi enviado');
    res.redirect('/auth/login');

  } catch (err) {
    console.error('Erro ao enviar link de recuperação:', err);
    req.flash('error_msg', 'Ocorreu um erro ao processar sua solicitação');
    res.redirect('/auth/forgot-password');
  }
};

// Exibe o formulário de redefinição (com token e email)
exports.showResetPasswordForm = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error_msg', 'Token de recuperação inválido ou expirado');
      return res.redirect('/auth/forgot-password');
    }

    res.render('reset-password', {
      title: 'Redefinir Senha - Lumina Edu',
      csrfToken: req.csrfToken(),
      token: req.params.token,
      email: user.email
    });

  } catch (err) {
    console.error('Erro ao exibir o formulário de redefinição:', err);
    req.flash('error_msg', 'Ocorreu um erro ao processar sua solicitação');
    res.redirect('/auth/forgot-password');
  }
};

// Processa a redefinição da senha
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('error_msg', 'As senhas não coincidem');
      return res.redirect(`/auth/reset-password/${token}`);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error_msg', 'Token de recuperação inválido ou expirado');
      return res.redirect('/auth/forgot-password');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendPasswordChangedConfirmation(user.email);

    req.flash('success_msg', 'Sua senha foi redefinida com sucesso. Faça login com sua nova senha');
    res.redirect('/auth/login');

  } catch (err) {
    console.error('Erro ao redefinir a senha:', err);
    req.flash('error_msg', 'Ocorreu um erro ao redefinir sua senha');
    res.redirect('/auth/forgot-password');
  }
};
