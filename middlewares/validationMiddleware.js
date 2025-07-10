const { body, validationResult } = require('express-validator');

// Suas validações existentes (register, etc.)
exports.validateRegister = [
  // ... suas validações atuais de registro ...
];

// Novas validações para recuperação de senha
exports.validateForgotPassword = [
  body('email')
    .isEmail().withMessage('Por favor, insira um e-mail válido')
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('forgot-password', { 
        title: 'Recuperar Senha - Lumina Edu',
        error_msg: errors.array()[0].msg,
        csrfToken: req.csrfToken()
      });
    }
    next();
  }
];

exports.validateResetPassword = [
  body('password')
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('As senhas não coincidem');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('reset-password', { 
        title: 'Redefinir Senha - Lumina Edu',
        error_msg: errors.array()[0].msg,
        token: req.body.token,
        email: req.body.email,
        csrfToken: req.csrfToken()
      });
    }
    next();
  }
];