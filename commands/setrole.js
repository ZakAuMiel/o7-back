const { SlashCommandBuilder } = require('discord.js');
const { setRole } = require('../utils/whitelist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrole')
    .setDescription('Ajoute ou modifie un rôle pour un utilisateur')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur cible')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('role')
        .setDescription('Rôle à attribuer (ami ou streamer)')
        .setRequired(true)
        .addChoices(
          { name: 'ami', value: 'ami' },
          { name: 'streamer', value: 'streamer' }
        )),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getString('role');

      // ⛑️ Logique principale
      setRole(user.id, role);

      await interaction.reply({
        content: `✅ **${user.tag}** a été ajouté/modifié en tant que \`${role}\`.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('❌ Erreur dans /setrole :', error);

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply('❌ Une erreur est survenue lors de l’attribution du rôle.');
      } else {
        await interaction.reply({
          content: '❌ Une erreur est survenue lors de l’attribution du rôle.',
          ephemeral: true
        });
      }
    }
  }
};
