const path = require("path");
const fs = require("fs");

const uploadMedia = async (req, res) => {
  try {
    const {
      username,
      avatarUrl,
      displaySize,
      duration,
      message,
      externalUrl
    } = req.body;

    const file = req.file;
    const io = req.app.get('io');

    let mediaUrl = null;
    let type = 'image'; // par défaut
    let filePath = null; // chemin absolu du fichier

    // 🧠 Déterminer la source du média (priorité au lien externe)
    if (externalUrl && externalUrl.trim() !== '') {
      mediaUrl = externalUrl.trim();
      type = mediaUrl.includes('youtu') || mediaUrl.includes('tiktok') || mediaUrl.includes('mp4')
        ? 'video'
        : 'image';
    } else if (file) {
      mediaUrl = `/uploads/${file.filename}`;
      type = file.mimetype.startsWith('video') ? 'video' : 'image';
      filePath = path.join(__dirname, '..', 'uploads', file.filename);

      // ⏳ Suppression programmée dans 5 minutes
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Erreur suppression fichier :', err);
          } else {
            console.log(`🗑️ Fichier supprimé automatiquement : ${file.filename}`);
          }
        });
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      return res.status(400).json({ message: 'Aucun média fourni' });
    }

    const payload = {
      url: mediaUrl,
      type,
      username,
      avatarUrl,
      displaySize,
      message
    };

    if (duration && duration !== '' && !isNaN(Number(duration))) {
      payload.duration = Number(duration);
    }

    console.log('🎬 Payload envoyé à overlay :', payload);
    io.emit('new-media', payload);

    return res.status(200).json({ success: true, file: payload });

  } catch (error) {
    console.error('❌ Erreur upload:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { handleUpload: uploadMedia };
