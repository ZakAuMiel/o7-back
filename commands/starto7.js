const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starto7')
    .setDescription('📡 Confirme que le bot 07-Logger est en ligne'),

  async execute(interaction) {
    try {
      await interaction.reply({
        content: '✅ **07-Logger** est en ligne et prêt à fonctionner.',
        ephemeral: true
      });
    } catch (err) {
      console.error('❌ Erreur /starto7 :', err);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply('❌ Une erreur est survenue.');
      } else {
        await interaction.reply({
          content: '❌ Une erreur est survenue.',
          ephemeral: true
        });
      }
    }
  }
};
