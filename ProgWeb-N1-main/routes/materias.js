// routes/materias.js
const express = require('express');
const router = express.Router();
const Disciplina = require('../models/Disciplina');

router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const materia = await Disciplina.findOne({ slug }).lean();

    if (!materia) {
      return res.status(404).render('404'); // ou renderiza outro erro
    }

    // Aqui você está enviando a variável `materia` pra view 👇
    res.render(`materias/${slug}`, {
      materia,
      title: materia.nome + ' - ENEM' // se quiser usar no header
    });

  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    res.status(500).send('Erro interno no servidor');
  }
});

module.exports = router;