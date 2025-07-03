const express = require('express');
const router = express.Router();

// Rota para a página inicial
router.get('/', (req, res) => {
  res.render('index', { title: 'Início - Lumina Edu' });
});

// Rota para Meus Cronogramas
router.get('/meus-cronogramas', (req, res) => {
  res.render('cronogramas', { title: 'Meus Cronogramas - Lumina Edu' });
});

// Rota para Provas Antigas
router.get('/provas-antigas', (req, res) => {
  res.render('provas', { title: 'Provas Antigas - Lumina Edu' });
});

// Rota para Disciplinas
router.get('/disciplinas', (req, res) => {
  res.render('disciplinas', { title: 'Disciplinas - Lumina Edu' });
});

// Rota para Simulados
router.get('/simulados', (req, res) => {
  res.render('simulados', { title: 'Simulados - Lumina Edu' });
});

// Rota para Login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login - Lumina Edu' });
});

router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login - Lumina Edu',
    layout: 'layout-login' // Opcional: crie um layout diferente para login
  });
});

module.exports = router;