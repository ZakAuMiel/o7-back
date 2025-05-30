const { SlashCommandBuilder } = require('discord.js');
const { listAll } = require('../utils/whitelist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listfriends')
    .setDescription('Liste tous les utilisateurs autorisés'),

  async execute(interaction) {
    const roles = listAll();

    if (Object.keys(roles).length === 0) {
      return interaction.reply({ content: '👥 La whitelist est vide.', ephemeral: true });
    }

    const message = Object.entries(roles)
      .map(([id, role]) => `- <@${id}> → \`${role}\``)
      .join('\n');

    await interaction.reply({ content: `📜 **Whitelist actuelle :**\n${message}`, ephemeral: true });
  }
};
