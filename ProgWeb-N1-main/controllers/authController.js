const User = require('../models/User');

exports.showRegistrationForm = (req, res) => {
  res.render('register', { 
    title: 'Cadastro - Lumina Edu',
    csrfToken: req.csrfToken()  // Adiciona CSRF
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verifica se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error_msg', 'E-mail já cadastrado');
      return res.redirect('/auth/register');
    }

    // Cria novo usuário
    const user = await User.create({ name, email, password });

    // Login automático após registro
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