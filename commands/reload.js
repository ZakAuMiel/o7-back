const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('🔄 Recharge toutes les commandes du bot sans redémarrage'),

  async execute(interaction) {
    try {
      const commandsPath = path.join(__dirname);
      const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith('.js') && file !== 'reload.js');

      interaction.client.commands.clear();

      for (const file of commandFiles) {
        delete require.cache[require.resolve(path.join(commandsPath, file))];
        const command = require(path.join(commandsPath, file));
        interaction.client.commands.set(command.data.name, command);
      }

      await interaction.reply({
        content: `✅ **${interaction.client.commands.size}** commandes rechargées avec succès.`,
        ephemeral: true
      });
    } catch (err) {
      console.error("❌ Erreur dans /reload :", err);
      await interaction.reply({
        content: "❌ Une erreur est survenue lors du rechargement.",
        ephemeral: true
      });
    }
  }
};
