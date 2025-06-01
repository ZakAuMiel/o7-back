const {
  Client,
  GatewayIntentBits,
  Events
} = require('discord.js');

const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const ALLOWED_ROLE_NAMES = ['ami', 'streamer'];

// 🔄 Sync tous les membres avec rôle autorisé
const syncAllowedRoles = async (guild) => {
  try {
    const members = await guild.members.fetch();

    for (const [, member] of members) {
      for (const role of member.roles.cache.values()) {
        const roleName = role.name.toLowerCase();
        if (!ALLOWED_ROLE_NAMES.includes(roleName)) continue;

        const exists = await db.query(
          "SELECT * FROM allowed_roles WHERE userId = $1 AND guildId = $2",
          [member.id, guild.id]
        );

        if (exists.rows.length === 0) {
          await db.query(
            "INSERT INTO allowed_roles (userId, guildId, roleName, accessLevel) VALUES ($1, $2, $3, $4)",
            [
              member.id,
              guild.id,
              roleName,
              roleName === 'streamer' ? 'admin' : 'user'
            ]
          );
          console.log(`✅ Ajouté : ${member.user.username} (${roleName})`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Erreur syncAllowedRoles :", err);
  }
};

// ✅ Quand le bot est prêt
client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  for (const [guildId, guild] of client.guilds.cache) {
    await db.query(
      "INSERT INTO guilds (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [guild.id, guild.name]
    );
    await syncAllowedRoles(guild);
  }
});

// 🔁 Ajout de membre ou rôle
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(
    role => !oldMember.roles.cache.has(role.id)
  );

  for (const [, role] of addedRoles) {
    const roleName = role.name.toLowerCase();
    if (!ALLOWED_ROLE_NAMES.includes(roleName)) return;

    const exists = await db.query(
      "SELECT * FROM allowed_roles WHERE userId = $1 AND guildId = $2",
      [newMember.id, newMember.guild.id]
    );

    if (exists.rows.length === 0) {
      await db.query(
        "INSERT INTO allowed_roles (userId, guildId, roleName, accessLevel) VALUES ($1, $2, $3, $4)",
        [
          newMember.id,
          newMember.guild.id,
          roleName,
          roleName === 'streamer' ? 'admin' : 'user'
        ]
      );
      console.log(`🆕 Nouveau rôle : ${newMember.user.username} (${roleName})`);
    }
  }
});

// 🔄 Quand le bot rejoint un nouveau serveur
client.on(Events.GuildCreate, async (guild) => {
  await db.query(
    "INSERT INTO guilds (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [guild.id, guild.name]
  );
  await syncAllowedRoles(guild);
});

process.on('unhandledRejection', err => {
  console.error('💥 Unhandled Promise:', err);
});

module.exports = {
  startBot: () => client.login(process.env.DISCORD_BOT_TOKEN),
  client
};
