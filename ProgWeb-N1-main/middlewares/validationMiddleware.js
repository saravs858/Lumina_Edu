const { check } = require('express-validator');

exports.validateRegister = [
  check('name', 'Nome é obrigatório').notEmpty().trim().escape(),
  check('email', 'Email inválido').isEmail().normalizeEmail(),
  check('password', 'Senha deve ter pelo menos 6 caracteres').isLength({ min: 6 }),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('As senhas não coincidem');
    return true;
  })
];