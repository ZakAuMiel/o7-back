//uploadController.js
const path = require("path");
const fs = require("fs");

const uploadMedia = async (req, res) => {
  try {
    const { username, avatarUrl, displaySize, duration, message, externalUrl } =
      req.body;
    const file = req.file;
    const io = req.app.get("io");

    let mediaUrl = null;
    let type = "image";
    let filePath = null;

    if (externalUrl && externalUrl.trim() !== "") {
      mediaUrl = externalUrl.trim();
      type =
        mediaUrl.includes("mp4") || mediaUrl.includes("youtu")
          ? "video"
          : "image";
    } else if (file) {
      mediaUrl = `/uploads/${file.filename}`;
      type = file.mimetype.startsWith("video") ? "video" : "image";
      filePath = path.join(__dirname, "..", "public", "uploads", file.filename);

      // 🕒 Suppression auto après 5 minutes
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Erreur suppression fichier :", err);
          else console.log(`🗑️ Fichier supprimé : ${file.filename}`);
        });
      }, 5 * 60 * 1000);
    } else {
      return res.status(400).json({ message: "Aucun média fourni." });
    }

    const payload = {
      url: mediaUrl,
      type,
      username,
      avatarUrl,
      displaySize,
      message,
    };

    if (duration && !isNaN(Number(duration))) {
      payload.duration = Number(duration);
    }

    console.log("🎬 Payload envoyé à overlay :", payload);
    io.emit("new-media", payload);

    return res.status(200).json({ success: true, file: payload });
  } catch (err) {
    console.error("❌ Erreur upload:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { handleUpload: uploadMedia };
