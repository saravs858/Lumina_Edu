// models/Disciplina.js
const mongoose = require('mongoose');

const DisciplinaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  area: String,
  descricao: String,
  conteudos: [
    {
      titulo: String,
      descricao: String,
      materiais: [
        {
          tipo: String,
          link: String
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Disciplina', DisciplinaSchema);
