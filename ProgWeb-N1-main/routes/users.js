const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const uploadPerfil = require('../middlewares/multerPerfil'); // novo multer para perfil

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
    user: req.user,
    csrfToken: req.csrfToken() // para o modal funcionar
  });
});

/* ✏️ Rota para editar perfil (POST via modal) */
router.post('/editar', isAuthenticated, uploadPerfil.single('imagem'), async (req, res) => {
  try {
    const { nome, senha, imagemAntiga } = req.body;
    let novaImagem = imagemAntiga; // mantém a antiga se não enviar nova

    // Se enviou nova imagem
    if (req.file) {
      novaImagem = 'users/' + req.file.filename;

      // Apagar imagem antiga se existir e for diferente do padrão
      if (imagemAntiga && imagemAntiga !== 'avatar-default.png') {
        const caminhoAntigo = path.join('public', 'images', imagemAntiga);
        if (fs.existsSync(caminhoAntigo)) {
          fs.unlinkSync(caminhoAntigo);
        }
      }
    }

    // Monta objeto de atualização
    let dadosAtualizados = { nome, imagem: novaImagem };

    // Se o usuário digitou nova senha, criptografa
    if (senha && senha.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      dadosAtualizados.senha = await bcrypt.hash(senha, salt);
    }

    // Atualiza no banco
    await User.findByIdAndUpdate(req.user._id, dadosAtualizados);

    req.flash('success_msg', 'Perfil atualizado com sucesso!');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao atualizar perfil');
    res.redirect('/users');
  }
});

/* 🗑️ Rota para deletar conta */
router.post('/deletar', isAuthenticated, async (req, res) => {
  try {
    // Remove imagem do usuário se existir e não for padrão
    if (req.user.imagem && req.user.imagem !== 'avatar-default.png') {
      const caminhoImagem = path.join('public', 'images', req.user.imagem);
      if (fs.existsSync(caminhoImagem)) {
        fs.unlinkSync(caminhoImagem);
      }
    }

    // Remove usuário
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