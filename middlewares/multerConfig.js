const multer = require('multer');
const path = require('path');

// 🔧 On enregistre maintenant dans "public/uploads/"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

module.exports = multer({ storage });
