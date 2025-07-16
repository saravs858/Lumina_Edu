const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware para proteger rotas de usuário
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error_msg', 'Faça login para acessar sua conta');
  res.redirect('/auth/login');
}

/* 👤 Rota principal do usuário (exibe perfil) */
router.get('/', isAuthenticated, (req, res) => {
  res.render('perfil', {
    title: 'Meu Perfil',
    user: req.user
  });
});

/* ✏️ Rota para editar perfil (GET) */
router.get('/editar', isAuthenticated, (req, res) => {
  res.render('editarPerfil', {
    title: 'Editar Perfil',
    user: req.user
  });
});

/* ✏️ Rota para editar perfil (POST) */
router.post('/editar', isAuthenticated, async (req, res) => {
  try {
    const { nome } = req.body;
    await User.findByIdAndUpdate(req.user._id, { nome });
    req.flash('success_msg', 'Perfil atualizado com sucesso!');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao atualizar perfil');
    res.redirect('/users/editar');
  }
});

/* 🗑️ Rota para deletar conta */
router.post('/deletar', isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    req.logout(() => {
      req.flash('success_msg', 'Conta deletada com sucesso');
      res.redirect('/');
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao deletar conta');
    res.redirect('/users');
  }
});

module.exports = router;
