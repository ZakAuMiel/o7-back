const { SlashCommandBuilder } = require('discord.js');
const { getRole, remove } = require('../utils/whitelist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removefriend')
    .setDescription('Supprime un utilisateur de la whitelist')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à retirer')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const current = getRole(user.id);

    if (!current) {
      return interaction.reply({ content: `❌ ${user.username} n’est pas dans la whitelist.`, ephemeral: true });
    }

    remove(user.id);
    await interaction.reply({ content: `🗑️ ${user.username} a été retiré de la whitelist.`, ephemeral: true });
  }
};
