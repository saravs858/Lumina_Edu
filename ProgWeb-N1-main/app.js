const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose'); // Adicionado para conexão com MongoDB

// Carregar variáveis de ambiente
require('dotenv').config();

// Importe as rotas
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/authRoutes');
const registerRouter = require('./routes/registerRoutes'); // Nova rota de cadastro

const app = express();

// Conexão com o MongoDB (assíncrona)
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

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Alterado para true para melhor parsing
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de sessão otimizada
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'segredo_dev_lumina_edu',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // Para HTTPS em produção
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// Flash messages melhorado
app.use(flash());

// Passport inicialização
app.use(passport.initialize());
app.use(passport.session());

// Middleware de variáveis globais aprimorado
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.errors = req.flash('errors');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter); // Melhor organização prefixando /auth
app.use('/register', registerRouter); // Rota de cadastro

// Middleware de proteção de rotas (exemplo)
app.use('/dashboard', (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'Por favor, faça login primeiro');
    return res.redirect('/auth/login');
  }
  next();
});

// Captura 404 e encaminha para o manipulador de erros
app.use(function(req, res, next) {
  next(createError(404, 'Página não encontrada'));
});

// Manipulador de erros aprimorado
app.use(function(err, req, res, next) {
  // Log detalhado do erro
  console.error(`[ERRO] ${err.status || 500} - ${err.message}`);
  console.error(err.stack);

  // Define locals apenas para desenvolvimento
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderiza a página de erro
  res.status(err.status || 500);
  
  // Se for API, retorna JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.json({ 
      error: err.message,
      ...(req.app.get('env') === 'development' && { stack: err.stack })
    });
  }
  
  // Caso contrário, renderiza a view de erro
  res.render('error', {
    title: `Erro ${err.status || 500}`,
    layout: 'error-layout' // Você pode criar um layout específico para erros
  });
});

module.exports = app;