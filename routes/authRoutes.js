// File: authRoutes.js
const path = require("path");

const express = require("express");
const router = express.Router();
const axios = require("axios");

const authController = require("../controllers/authController");
const requireLogin = require("../middlewares/requireLogin");
const { client } = require("../services/discordBot");
const db = require("../services/db");



// ────────────────
// Route temporaire pour la database

// ────────────────

router.get("/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() AS current_time");
    res.json({ currentTime: result.rows[0].current_time });
  } catch (err) {
    console.error("❌ Erreur base de données:", err);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

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

  // Liste des noms de rôles autorisés
  const allowedRoles = ["ami", "streamer"];

  console.log("➡️ Reçu requête pour /verify-role avec :", { userId, guildId });

  if (!userId || !guildId) {
    return res.status(400).json({ error: "Missing user or guild ID" });
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    const allRoles = await guild.roles.fetch();

    // Obtenir les rôles du membre
    const memberRoleNames = member.roles.cache.map(role => role.name.toLowerCase());

    console.log("👤 Rôles de l'utilisateur :", memberRoleNames);

    // Vérifier s’il a un rôle autorisé
    const hasAllowedRole = memberRoleNames.some(roleName =>
      allowedRoles.includes(roleName)
    );

    if (hasAllowedRole) {
      console.log("✅ Accès autorisé");
      return res.json({ authorized: true });
    } else {
      console.warn("🚫 Accès refusé : aucun rôle autorisé trouvé");
      return res.status(403).json({ authorized: false });
    }
  } catch (err) {
    console.error("❌ Erreur vérif rôle:", err);
    res.status(500).json({ error: "Erreur Discord bot ou permissions manquantes" });
  }
});

module.exports = router;
