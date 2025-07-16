const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Estratégia local de login
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // 🔍 Inclui o campo 'password' na busca
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return done(null, false, { message: 'Email não registrado' });
    }

    // ✅ Verifica se a senha está presente e é uma string
    if (!user.password || typeof user.password !== 'string') {
      return done(null, false, { message: 'Senha inválida' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Senha incorreta' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Serialização do usuário
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Desserialização do usuário
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
