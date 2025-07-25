const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(to, token) {
  const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/reset-password/${token}`;

  const mailOptions = {
    from: 'Lumina Edu <naoresponda@luminaedu.com>',
    to,
    subject: 'Redefinição de Senha - Lumina Edu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center;">Redefinição de Senha</h2>
          
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta Lumina Edu.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;
                      display: inline-block;">
               Redefinir Minha Senha
            </a>
          </div>
          
          <p>Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
                     font-size: 12px; color: #777;">
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all;">${resetLink}</p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordChangedConfirmation(to) {
  const mailOptions = {
    from: 'Lumina Edu <naoresponda@luminaedu.com>',
    to,
    subject: 'Senha alterada com sucesso - Lumina Edu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center;">Senha Alterada</h2>
          <p>Sua senha foi alterada com sucesso em ${new Date().toLocaleString()}.</p>
          <p style="color: #e74c3c; font-weight: bold;">Se não foi você quem realizou esta alteração, 
             entre em contato imediatamente com nosso suporte.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedConfirmation
};