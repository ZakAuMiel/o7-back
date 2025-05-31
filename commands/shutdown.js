const { SlashCommandBuilder } = require('discord.js');
const { save } = require('../utils/whitelist'); // ou tout autre module à sauvegarder

// Ton ID Discord ici :
const OWNER_ID = '327801326861811713';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('⛔ Arrête proprement le bot après avoir sauvegardé les données'),

  async execute(interaction) {
    // Sécurité : seul l’owner peut éteindre le bot
    if (interaction.user.id !== OWNER_ID) {
      return await interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser cette commande.',
        ephemeral: true
      });
    }

    try {
      await interaction.reply({
        content: '🛑 Sauvegarde en cours… arrêt du bot imminent.',
        ephemeral: true
      });

      // 🔐 Appelle ici toutes les sauvegardes nécessaires
      save(); // ← tu peux appeler d’autres fonctions de sauvegarde si besoin

      console.log("💾 Sauvegarde terminée. Arrêt du bot demandé par :", interaction.user.tag);
      process.exit(0); // ⛔ Stop net le processus
    } catch (err) {
      console.error('❌ Erreur shutdown :', err);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply('❌ Échec de l’arrêt du bot.');
      } else {
        await interaction.reply({
          content: '❌ Échec de l’arrêt du bot.',
          ephemeral: true
        });
      }
    }
  }
};
