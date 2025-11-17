// uploadController.js
const path = require("path");
const fs = require("fs");
const axios = require("axios");

// 🧩 Helper : récupérer un MP4 direct à partir d'une URL TikTok (côté serveur)
async function getTikTokDirectUrl(tiktokUrl) {
  try {
    const apiUrl = `https://api.tikwm.com/video/?url=${encodeURIComponent(
      tiktokUrl
    )}`;

    const res = await axios.get(apiUrl);

    if (res?.data?.data?.play) {
      console.log("🎵 TikTok MP4 direct (server):", res.data.data.play);
      return res.data.data.play; // URL MP4 lisible par <video>
    }

    console.warn("⚠️ TikTok API: pas de champ .data.play");
    return null;
  } catch (err) {
    console.error("❌ TikTok API error:", err.message || err);
    return null;
  }
}

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

    // 1️⃣ URL externe (YouTube / Twitch / TikTok / MP4 / audio / image)
    if (externalUrl && externalUrl.trim() !== "") {
      const clean = externalUrl.trim();

      // --- TIKTOK : on essaie de convertir en MP4 direct ---
      if (clean.includes("tiktok.com")) {
        const mp4Url = await getTikTokDirectUrl(clean);

        if (mp4Url) {
          mediaUrl = mp4Url;
          type = "video"; // MP4 externe
        } else {
          // fallback : on garde le lien brut (au cas où tu voudrais l'embed un jour)
          mediaUrl = clean;
          type = "tiktok";
        }
      }

      // --- YOUTUBE ---
      else if (clean.includes("youtube.com") || clean.includes("youtu.be")) {
        mediaUrl = clean;
        type = "youtube";
      }

      // --- TWITCH ---
      else if (clean.includes("twitch.tv")) {
        mediaUrl = clean;
        type = "twitch";
      }

      // --- AUDIO direct ---
      else if (/\.(mp3|wav|ogg)(\?|#|$)/i.test(clean)) {
        mediaUrl = clean;
        type = "audio";
      }

      // --- VIDEO direct (mp4, webm, mov...) ---
      else if (/\.(mp4|webm|mov)(\?|#|$)/i.test(clean)) {
        mediaUrl = clean;
        type = "video";
      }

      // --- fallback : image / autre ---
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

      // 🕒 Suppression auto après 5 minutes
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Erreur suppression fichier :", err);
          else console.log(`🗑️ Fichier supprimé : ${file.filename}`);
        });
      }, 5 * 60 * 1000);
    }

    // 3️⃣ Aucun média fourni
    else {
      return res.status(400).json({ message: "Aucun média fourni." });
    }

    // 4️⃣ Construction du payload pour l'overlay
    const payload = {
      url: mediaUrl,
      type, // "video" | "audio" | "image" | "youtube" | "twitch" | "tiktok"
      username,
      avatarUrl,
      displaySize,
      message,
    };

    // Durée (ms)
    if (duration && !isNaN(Number(duration))) {
      payload.duration = Number(duration);
    }

    // Layout (drag & drop depuis Upload.vue)
    if (layout) {
      try {
        payload.layout = JSON.parse(layout);
      } catch (e) {
        console.warn("⚠️ Layout invalide, ignoré :", e.message || e);
      }
    }

    console.log("🎬 Payload envoyé à overlay :", payload);

    // 5️⃣ Broadcast à l'overlay
    io.emit("new-media", payload);

    return res.status(200).json({ success: true, file: payload });
  } catch (err) {
    console.error("❌ Erreur upload:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { handleUpload: uploadMedia };
