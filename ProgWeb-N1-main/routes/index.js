const express = require('express');
const router = express.Router();

// Rota para a página inicial
router.get('/', (req, res) => {
  res.render('index', { title: 'Início - Lumina Edu' });
});

// Rota para a página inicial
router.get('/inicial', (req, res) => {
  res.render('inicial', { title: 'Lumina Edu' });
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
  const simulados = [
    { id: '001', titulo: 'Matemática Básica', materia: 'matematica', dificuldade: 'Fácil' },
    { id: '002', titulo: 'Português Avançado', materia: 'portugues', dificuldade: 'Difícil' },
    { id: '003', titulo: 'História Geral', materia: 'historia', dificuldade: 'Médio' }
  ];

  res.render('simulados', { simulados }); // ✅ aqui é onde você passa os dados
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