// File: authRoutes.js
const path = require("path");

const express = require("express");
const router = express.Router();
const axios = require("axios");

const authController = require("../controllers/authController");
const requireLogin = require("../middlewares/requireLogin");
const { client } = require("../services/discordBot");

// ────────────────


// ────────────────
// 🔐 Authentification Discord
// ────────────────

router.get("/login", authController.login);
router.get("/callback", authController.callback);

// ────────────────
// 📡 Récupération des serveurs Discord (via OAuth2)
// ────────────────

router.get("/discord/guilds", requireLogin, async (req, res) => {
  // Vérifie si l'utilisateur est authentifié
  console.log("Session reçue sur /discord/guilds:", req.session);

  const accessToken = req.session?.access_token;
  if (!accessToken) return res.status(401).json({ error: "Not authenticated" });

  try {
    const { data } = await axios.get(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Serveurs où le bot est aussi présent
    const botGuilds = await client.guilds.fetch();
    const filtered = data.filter((guild) => botGuilds.has(guild.id));

    res.json(filtered);
  } catch (err) {
    console.error("❌ Erreur récupération guilds:", err);
    res.status(500).json({ error: "Erreur Discord API" });
  }
});

//// ────────────────
//
// 📸 Récupération de l'avatar Discord
// ────────────────

router.get("/me", requireLogin, (req, res) => {
  const { username, avatar, id } = req.session.user || {};
  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
    : null;
  res.json({ username, avatarUrl });
});

// ────────────────
// 🛡️ Vérification du rôle du user dans un serveur
// ────────────────

router.get("/verify-role", requireLogin, async (req, res) => {
  const userId = req.session?.user?.id;
  const guildId = req.query.guildId;

  const roles = {
    "327801326861811713": "streamer",
    "324296042084302849": "ami"
  };
  const role = roles[userId];

  console.log("➡️ Reçu requête pour /verify-role avec :", { userId, guildId });
  console.log("📂 Roles disponibles :", roles);
  console.log("🔍 Role trouvé :", role);

  if (!userId || !guildId) {
    return res.status(400).json({ error: "Missing user or guild ID" });
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    console.log(`👤 ${member.user.username} est membre du serveur "${guild.name}"`);

    if (role === "ami" || role === "streamer") {
      console.log("✅ Accès autorisé");
      return res.json({ role });
    } else {
      console.warn("🚫 Accès refusé : rôle non autorisé");
      return res.status(403).json({ error: "Role non autorisé" });
    }
  } catch (err) {
    console.error("❌ Erreur vérif rôle:", err);
    res.status(500).json({ error: "Erreur Discord bot ou permissions manquantes" });
  }
});

module.exports = router;
