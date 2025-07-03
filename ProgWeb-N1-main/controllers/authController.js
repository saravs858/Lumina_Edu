const User = require('../models/User');

exports.loginForm = (req, res) => {
    res.render('login', { 
        title: 'Login',
        error: req.flash('error') 
    });
};

exports.login = (req, res, next) => {
    // A autenticação em si será feita pelo Passport
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};