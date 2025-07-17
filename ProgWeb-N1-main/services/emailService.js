// emailService.js

const nodemailer = require('nodemailer');

// Isso é só um exemplo de transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Usa .env pra proteger info sensível
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(to, token) {
  const resetLink = `http://localhost:3000/auth/reset-password/${token}`;

  const mailOptions = {
    from: 'Lumina Edu <naoresponda@luminaedu.com>',
    to,
    subject: 'Redefinição de Senha',
    html: `
      <p>Você solicitou a redefinição da sua senha.</p>
      <p>Clique no link abaixo para escolher uma nova senha:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordChangedConfirmation(to) {
  const mailOptions = {
    from: 'Lumina Edu <naoresponda@luminaedu.com>',
    to,
    subject: 'Senha alterada com sucesso',
    html: `<p>Sua senha foi alterada com sucesso. Se não foi você, entre em contato imediatamente com o suporte.</p>`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedConfirmation
};
