// uploadController.js
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

    // 🔗 CAS 1 : URL externe (YouTube, TikTok, Twitch, etc.)
    if (externalUrl && externalUrl.trim() !== "") {
      mediaUrl = externalUrl.trim();
      const lower = mediaUrl.toLowerCase();

      const isYouTube =
        lower.includes("youtube.com") || lower.includes("youtu.be");
      const isTikTok = lower.includes("tiktok.com");
      const isTwitch = lower.includes("twitch.tv");

      if (isYouTube) {
        type = "youtube";
      } else if (isTikTok) {
        type = "tiktok";
      } else if (isTwitch) {
        type = "twitch";
      } else if (lower.endsWith(".mp3")) {
        type = "audio";
      } else if (
        lower.endsWith(".mp4") ||
        lower.endsWith(".mov") ||
        lower.endsWith(".webm")
      ) {
        type = "video";
      } else {
        type = "image";
      }
    }
    // 📁 CAS 2 : fichier uploadé
    else if (file) {
      mediaUrl = `/uploads/${file.filename}`;
      const mime = file.mimetype;

      if (mime.startsWith("audio")) {
        type = "audio";
      } else if (mime.startsWith("video")) {
        type = "video";
      } else {
        type = "image";
      }

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
      type, // "youtube" | "tiktok" | "twitch" | "audio" | "video" | "image"
      username,
      avatarUrl,
      displaySize,
      message,
    };

    if (duration && !isNaN(Number(duration))) {
      payload.duration = Number(duration);
    }

    console.log("🎬 Payload envoyé à overlay :", payload);
    io.emit("new-media", payload); // plus tard: io.to(roomName).emit(...)

    return res.status(200).json({ success: true, file: payload });
  } catch (err) {
    console.error("❌ Erreur upload:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { handleUpload: uploadMedia };
