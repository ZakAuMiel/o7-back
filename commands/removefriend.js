const { SlashCommandBuilder } = require('discord.js');
const { getRole, remove } = require('../utils/whitelist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removefriend')
    .setDescription('Supprime un utilisateur de la whitelist')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à retirer')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const current = getRole(user.id);

      if (!current) {
        return await interaction.reply({
          content: `❌ **${user.tag}** n’est pas dans la whitelist.`,
          ephemeral: true
        });
      }

      const success = remove(user.id);

      if (success) {
        await interaction.reply({
          content: `🗑️ **${user.tag}** a été retiré de la whitelist (${current}).`,
          ephemeral: true
        });
      } else {
        throw new Error("La suppression a échoué (non trouvé ?)");
      }
    } catch (err) {
      console.error("❌ Erreur /removefriend :", err);

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply('❌ Une erreur est survenue lors de la suppression.');
      } else {
        await interaction.reply({
          content: '❌ Une erreur est survenue lors de la suppression.',
          ephemeral: true
        });
      }
    }
  }
};
