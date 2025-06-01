const axios = require("axios");

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ALLOWED_ROLE_NAMES = ["ami", "streamer"]; // à personnaliser

const verifyUserRole = async (req, res) => {
  const { guildId } = req.query;
  const user = req.session.user;

  if (!guildId || !user) {
    return res.status(400).json({ error: "Missing guildId or user" });
  }

  try {
    // Récup info du membre (via le bot)
    const memberRes = await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}/members/${user.id}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      }
    );

    const rolesInGuild = memberRes.data.roles;

    // Récup toutes les infos de rôles pour obtenir les noms
    const rolesRes = await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      }
    );

    const allRoles = rolesRes.data;

    const userRoleNames = rolesInGuild
      .map((id) => allRoles.find((r) => r.id === id)?.name)
      .filter(Boolean);

    const isAuthorized = userRoleNames.some((r) =>
      ALLOWED_ROLE_NAMES.includes(r.toLowerCase())
    );

    if (isAuthorized) {
      return res.json({ authorized: true });
    } else {
      return res.status(403).json({ authorized: false });
    }
  } catch (err) {
    console.error("Role check error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to verify role" });
  }
};

module.exports = { verifyUserRole };
