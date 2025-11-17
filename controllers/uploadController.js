// uploadController.js
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
      externalUrl,
      layout,
    } = req.body;

    const file = req.file;
    const io = req.app.get("io");

    let mediaUrl = null;
    let type = "image";
    let filePath = null;

    // 1️⃣ URL externe (YouTube / Twitch / MP4 / MP3 / image / etc.)
    if (externalUrl && externalUrl.trim() !== "") {
      const clean = externalUrl.trim();

      // YouTube
      if (clean.includes("youtube.com") || clean.includes("youtu.be")) {
        mediaUrl = clean;
        type = "youtube";
      }

      // Twitch
      else if (clean.includes("twitch.tv")) {
        mediaUrl = clean;
        type = "twitch";
      }

      // Audio direct
      else if (/\.(mp3|wav|ogg)(\?|#|$)/i.test(clean)) {
        mediaUrl = clean;
        type = "audio";
      }

      // Vidéo directe (MP4 / WebM / MOV)
      else if (/\.(mp4|webm|mov)(\?|#|$)/i.test(clean)) {
        mediaUrl = clean;
        type = "video";
      }

      // fallback : image ou autre
      else {
        mediaUrl = clean;
        type = "image";
      }
    }

    // 2️⃣ Fichier uploadé
    else if (file) {
      mediaUrl = `/uploads/${file.filename}`;
      const mime = file.mimetype || "";

      if (mime.startsWith("video")) type = "video";
      else if (mime.startsWith("audio")) type = "audio";
      else type = "image";

      filePath = path.join(__dirname, "..", "public", "uploads", file.filename);

      // Suppression auto après 5 minutes
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Erreur suppression fichier :", err);
          else console.log(`🗑️ Fichier supprimé : ${file.filename}`);
        });
      }, 5 * 60 * 1000);
    }

    // 3️⃣ Aucun media
    else {
      return res.status(400).json({ message: "Aucun média fourni." });
    }

    // 4️⃣ Payload overlay
    const payload = {
      url: mediaUrl,
      type, // "video" | "audio" | "image" | "youtube" | "twitch"
      username,
      avatarUrl,
      displaySize,
      message,
    };

    // durée (en ms)
    if (duration && !isNaN(Number(duration))) {
      payload.duration = Number(duration);
    }

    // layout (scène draggable)
    if (layout) {
      try {
        payload.layout = JSON.parse(layout);
      } catch (e) {
        console.warn("⚠️ Layout invalide, ignoré :", e.message || e);
      }
    }

    console.log("🎬 Payload envoyé à overlay :", payload);

    // 5️⃣ broadcast
    io.emit("new-media", payload);

    return res.status(200).json({ success: true, file: payload });
  } catch (err) {
    console.error("❌ Erreur upload:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { handleUpload: uploadMedia };
