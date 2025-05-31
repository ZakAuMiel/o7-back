const {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  REST,
  Routes
} = require('discord.js');

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const guildId = '1372250240597622985'; // Ton serveur Discord
const ownerId = '327801326861811713'; // Ton ID Discord pour les messages privés

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 📦 Chargement dynamique des commandes
client.commands = new Collection();
const commands = [];

const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.data || !command.execute) {
    console.warn(`⚠️ La commande "${file}" est incomplète.`);
    continue;
  }

  console.log(`📦 Commande chargée : ${command.data.name}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// ✅ Lorsque le bot est prêt
client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commands }
    );
    console.log(`🚀 Commandes slash enregistrées : ${commands.map(c => c.name).join(', ')}`);
  } catch (err) {
    console.error('❌ Échec de l’enregistrement des commandes slash :', err);
  }

  // ✅ Envoi d’un message privé à Zakaria
  try {
    const zak = await client.users.fetch(ownerId);
    if (zak) {
      await zak.send('✅ **07-Logger** est maintenant en ligne et opérationnel !');
    }
  } catch (err) {
    console.error('❌ Impossible d’envoyer le message de démarrage :', err);
  }
});

// 🎮 Gestion des interactions slash
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(`❓ Commande introuvable : ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Erreur pendant la commande "/${interaction.commandName}" :`, err);
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply('❌ Une erreur est survenue pendant l’exécution.');
    } else {
      await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
    }
  }
});

// 🔁 Protection anti crash non catché
process.on('unhandledRejection', error => {
  console.error('💥 Unhandled Promise Rejection :', error);
});

module.exports = {
  startBot: () => client.login(process.env.DISCORD_BOT_TOKEN),
  client
};
