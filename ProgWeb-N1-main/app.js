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
const fs = require('fs');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

// =============================================
// CONEXÃO COM O MONGODB
// =============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina_edu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro na conexão com MongoDB:', err));

// =============================================
// CONFIGURAÇÃO DO PASSPORT
// =============================================
require('./config/auth');

// =============================================
// VIEW ENGINE
// =============================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// MIDDLEWARES BÁSICOS
// =============================================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'segredo_cookie_lumina_edu'));
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// SESSÃO (USANDO CONNECT-MONGO)
// =============================================
const sessionConfig = {
  name: 'lumina_edu.sid',
  secret: process.env.SESSION_SECRET || 'segredo_dev_lumina_edu',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina_edu',
    collectionName: 'sessions'
  })
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
  sessionConfig.cookie.sameSite = 'none';
}

app.use(session(sessionConfig));

// =============================================
// SEGURANÇA
// =============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      frameSrc: ["'self'"]
    }
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// =============================================
// RATE LIMITING
// =============================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas tentativas de login. Tente novamente mais tarde.'
});

app.use('/api/', apiLimiter);
app.use('/auth/', authLimiter);

// =============================================
// CSRF PROTECTION
// =============================================
const csrf = require('csurf');
const csrfProtection = csrf({ 
  cookie: {
    key: '_csrf_lumina',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400
  }
});

app.use(csrfProtection);

// =============================================
// FLASH + PASSPORT
// =============================================
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// =============================================
// VARIÁVEIS GLOBAIS NAS VIEWS
// =============================================
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.errors = req.flash('errors');
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentPath = req.path;
  res.locals.env = process.env.NODE_ENV || 'development';
  next();
});

// =============================================
// ROTAS
// =============================================
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/authRoutes');
const materiasRouter = require('./routes/materias');

// 👇 IMPORTAÇÃO DO MODELO DISCIPLINA (corrige erro 500)
const Disciplina = require('./models/Disciplina');

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error_msg', 'Por favor, faça login para acessar esta página');
  res.redirect('/auth/login');
};

app.use('/', indexRouter);
app.use('/users', ensureAuthenticated, usersRouter);
app.use('/auth', authRouter);
app.use('/api/materias', ensureAuthenticated, materiasRouter);

app.get('/perfil', ensureAuthenticated, (req, res) => {
  res.render('auth/perfil', { 
    title: 'Perfil do Usuário',
    user: req.user 
  });
});

// =============================================
// ROTA DINÂMICA DE MATÉRIAS
// =============================================
app.get('/:materia', async (req, res, next) => {
  const slug = req.params.materia;
  console.log('Slug recebido:', slug);

  try {
    const materia = await Disciplina.findOne({ slug }).lean();
    console.log('Matéria encontrada:', materia);

    if (!materia) {
      console.log('Matéria não encontrada para slug:', slug);
      return next(createError(404, 'Matéria não encontrada no banco de dados'));
    }

    res.render(`materias/${slug}`, {
      title: `${materia.nome} - ENEM`,
      materia
    });
  } catch (err) {
    console.error('Erro ao buscar matéria no BD:', err);
    return next(createError(500, 'Erro interno ao carregar matéria'));
  }
});

// =============================================
// MANIPULAÇÃO DE ERROS
// =============================================
app.use((req, res, next) => {
  next(createError(404, 'Página não encontrada'));
});

app.use((err, req, res, next) => {
  console.error(`[ERRO ${new Date().toISOString()}] ${err.status || 500} - ${err.message}`);
  console.error(err.stack);

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);

  if (req.originalUrl.startsWith('/api')) {
    return res.json({
      success: false,
      error: {
        message: err.message,
        status: err.status || 500,
        ...(req.app.get('env') === 'development' && { stack: err.stack })
      }
    });
  }

  res.render('error', {
    title: `Erro ${err.status || 500}`,
    layout: 'error-layout',
    status: err.status || 500
  });
});

module.exports = app;
