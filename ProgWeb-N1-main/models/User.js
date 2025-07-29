const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório'],
    trim: true,
    minlength: [3, 'O nome deve ter pelo menos 3 caracteres']
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, insira um e-mail válido']
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória'],
    select: false,
    minlength: [8, 'A senha deve ter pelo menos 8 caracteres']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'student'],
    default: 'user'
  },
  resetToken: {
    type: String,
    select: false
  },
  resetTokenExpires: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para hash da senha
UserSchema.pre('save', async function(next) {
  // Só executa se a senha foi modificada
  if (!this.isModified('password')) return next();

  try {
    // Gera o salt e faz o hash da senha
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Atualiza a data de modificação
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para gerar token de reset
UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Cria hash do token e salva no banco
  this.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Define expiração para 10 minutos
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Filtra usuários inativos por padrão
UserSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

module.exports = mongoose.model('User', UserSchema);