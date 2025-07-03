const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Rota para exibir o formulário de cadastro
router.get('/register', (req, res) => {
  res.render('register', { 
    title: 'Cadastro - Lumina Edu',
    errors: req.flash('errors')
  });
});

// Rota para processar o cadastro
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  // Validações
  if (!name || !email || !password || !confirmPassword) {
    errors.push('Todos os campos são obrigatórios');
  }

  if (password !== confirmPassword) {
    errors.push('As senhas não coincidem');
  }

  if (password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres');
  }

  if (errors.length > 0) {
    req.flash('errors', errors);
    return res.redirect('/register');
  }

  try {
    // Simulação de cadastro (substitua pelo MongoDB depois)
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    console.log('Usuário simulado criado:', newUser); // Remova depois
    
    req.flash('success_msg', 'Cadastro realizado com sucesso!');
    res.redirect('/login');
  } catch (err) {
    req.flash('errors', ['Erro durante o cadastro']);
    res.redirect('/register');
  }
});

module.exports = router;