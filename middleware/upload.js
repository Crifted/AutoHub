const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadMap = path.join(__dirname, '..', 'public', 'img', 'uploads');
if (!fs.existsSync(uploadMap)) {
  fs.mkdirSync(uploadMap, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadMap),
  filename: (req, file, cb) => {
    const uniekeNaam = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniekeNaam);
  }
});

function bestandsfilter(req, file, cb) {
  const toegestaan = /jpeg|jpg|png|webp/;
  const extOk = toegestaan.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = toegestaan.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Alleen afbeeldingen (jpg, png, webp) zijn toegestaan.'));
  }
}

const upload = multer({
  storage,
  fileFilter: bestandsfilter,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5MB
});

module.exports = upload;
