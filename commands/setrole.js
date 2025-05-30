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
    const user = interaction.options.getUser('user');
    const role = interaction.options.getString('role');

    setRole(user.id, role);
    await interaction.reply({
      content: `✅ ${user.username} a été ajouté/modifié en tant que \`${role}\`.`,
      ephemeral: true
    });
  }
};
