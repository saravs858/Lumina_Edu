const multer = require('multer');
const path = require('path');
const fs = require('fs');

function criarPastaSeNaoExistir(pasta) {
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
}

const storagePerfil = multer.diskStorage({
  destination: (req, file, cb) => {
    const pastaFinal = path.join('public', 'images', 'users'); // pasta fixa para usuários
    criarPastaSeNaoExistir(pastaFinal);
    cb(null, pastaFinal);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'perfil-' + uniqueSuffix + ext); // nome fixo com prefixo "perfil"
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'));
  }
};

module.exports = multer({ storage: storagePerfil, fileFilter });
