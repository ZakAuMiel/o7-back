const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'friendRoles.json');

// ⬇ Charge la whitelist depuis le fichier
function load() {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (e) {
    console.warn("⚠️ Fichier friendRoles.json introuvable ou invalide. Initialisation vide.");
    return {};
  }
}

// ⬆ Sauvegarde la whitelist dans le fichier
function save(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("❌ Erreur lors de l'écriture de friendRoles.json :", e);
  }
}

// ➕ Ajoute ou modifie un rôle (ami / streamer)
function setRole(userId, role) {
  const list = load();
  list[userId] = role;
  save(list);
}

// ➖ Supprime un utilisateur de la whitelist
function remove(userId) {
  const list = load();
  if (list[userId]) {
    delete list[userId];
    save(list);
    return true;
  }
  return false;
}

// 🔎 Récupère le rôle d’un utilisateur (ou undefined)
function getRole(userId) {
  const list = load();
  return list[userId];
}

// ✅ Vérifie si l'utilisateur a un rôle autorisé
function isAllowed(userId) {
  const role = getRole(userId);
  return ['ami', 'streamer'].includes(role);
}

// 📃 Renvoie tous les utilisateurs avec leur rôle
function listAll() {
  return load();
}

module.exports = {
  load,
  save,
  setRole,
  getRole,
  isAllowed,
  remove,
  listAll
};
