const { SlashCommandBuilder } = require('discord.js');
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearglobalcommands')
    .setDescription('Supprime toutes les commandes globales enregistrées'),

  async execute(interaction) {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
      await rest.put(
        Routes.applicationCommands(interaction.client.user.id),
        { body: [] }
      );
      await interaction.reply({ content: '🧼 Commandes globales supprimées.', ephemeral: true });
    } catch (err) {
      console.error('❌ Erreur clearGlobalCommands:', err);
      await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
    }
  }
};
