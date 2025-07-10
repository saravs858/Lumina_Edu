const express = require('express');
const router = express.Router();

// Dados simulados das matérias e tópicos
const materias = [
  {
    nome: "Biologia",
    slug: "biologia",
    area: "Ciências da Natureza",
    icone: "fa-dna",
    cor: "bg-success",
    topicos: [
      { nome: "Citologia", feito: false },
      { nome: "Genética", feito: false },
      { nome: "Ecologia", feito: false },
      { nome: "Sistema Imunológico", feito: false }
    ]
  },
  {
    nome: "História",
    slug: "historia",
    area: "Ciências Humanas",
    icone: "fa-landmark",
    cor: "bg-danger",
    topicos: [
      { nome: "História Geral", feito: false },
      { nome: "História do Brasil", feito: false },
      { nome: "Era Vargas", feito: false }
    ]
  },
  {
    nome: "Português",
    slug: "portugues",
    area: "Linguagens",
    icone: "fa-book",
    cor: "bg-primary",
    topicos: [
      { nome: "Interpretação de Texto", feito: false },
      { nome: "Gramática", feito: false },
      { nome: "Figuras de Linguagem", feito: false }
    ]
  },
  {
    nome: "Matemática",
    slug: "matematica",
    area: "Matemática",
    icone: "fa-square-root-alt",
    cor: "bg-warning",
    topicos: [
      { nome: "Porcentagem", feito: false },
      { nome: "Funções", feito: false },
      { nome: "Estatística", feito: false }
    ]
  }
];

// 🧠 Retorna todas as matérias
router.get('/', (req, res) => {
  res.json(materias);
});

// 🔍 Retorna uma matéria específica pelo slug
router.get('/:slug', (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const materia = materias.find(m => m.slug === slug);
  
  if (materia) {
    res.json(materia);
  } else {
    res.status(404).json({ erro: "Matéria não encontrada" });
  }
});

module.exports = router;
