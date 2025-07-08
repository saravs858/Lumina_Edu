const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importe as rotas
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/authRoutes');

const app = express();

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina-edu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro na conexão com MongoDB:', err));

// Configuração do Passport
require('./config/auth');

// Configuração da view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// =============================================
// MIDDLEWARES BÁSICOS (CRÍTICOS PARA CSRF)
// =============================================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// CONFIGURAÇÃO DE SESSÃO (DEVE VIR ANTES DO CSRF)
// =============================================
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'segredo_dev_lumina_edu',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  }
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// =============================================
// CONFIGURAÇÃO CSRF (DEPOIS DE SESSÃO/COOKIE)
// =============================================
const csrf = require('csurf');
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});
app.use(csrfProtection);

// =============================================
// OUTRAS PROTEÇÕES DE SEGURANÇA
// =============================================
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente mais tarde.'
});

app.use('/api/', apiLimiter);
app.use('/auth/login', authLimiter);

// Flash messages
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

// =============================================
// MIDDLEWARE GLOBAL (INCLUI CSRF TOKEN NAS VIEWS)
// =============================================
app.use((req, res, next) => {
  // Variáveis globais para todas as views
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.errors = req.flash('errors');
  
  // Injeta o token CSRF em todas as respostas
  res.locals.csrfToken = req.csrfToken();
  
  next();
});

// =============================================
// ROTAS
// =============================================
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// Middleware de autenticação
app.use('/dashboard', (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'Por favor, faça login primeiro');
    return res.redirect('/auth/login');
  }
  next();
});

// =============================================
// MANIPULADORES DE ERRO
// =============================================
app.use(function(req, res, next) {
  next(createError(404, 'Página não encontrada'));
});

app.use(function(err, req, res, next) {
  // Log de erros
  console.error(`[ERRO] ${err.status || 500} - ${err.message}`);
  console.error(err.stack);

  // Define locals
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderiza a página de erro
  res.status(err.status || 500);
  
  if (req.originalUrl.startsWith('/api')) {
    return res.json({ 
      error: err.message,
      ...(req.app.get('env') === 'development' && { stack: err.stack })
    });
  }
  
  res.render('error', {
    title: `Erro ${err.status || 500}`,
    layout: 'error-layout'
  });
});

module.exports = app;