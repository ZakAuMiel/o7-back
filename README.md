## 🇬🇧 English Version

**07** is a live-stream enhancement system where friends can send **images, videos or sounds** that appear in an **OBS overlay**, along with their **Discord nickname and avatar**, plus fun animations.

---

### 🧱 Project Architecture

#### Backend (`o7-back`)
- Node.js + Express
- Socket.IO (real-time media trigger)
- Discord OAuth2 Authentication
- PostgreSQL for allowed roles (`streamer`, `friend`)
- Hosted on [Railway](https://railway.app/)

```
o7-back/
├── controllers/
├── routes/
├── services/
├── socket/
├── overlay/     ← HTML/JS overlay for OBS
├── db/
└── server.js
```

#### Frontend (`o7-front`)
- Vue 3 (Composition API)
- TailwindCSS + custom design
- GSAP for stylish animations
- Axios + Vue Router
- Hosted on [Vercel](https://vercel.com/)

```
o7-front/
├── src/
│   ├── components/
│   ├── pages/
│   ├── router/
│   ├── utils/
│   └── style.css
├── public/
└── .env
```

---

### 🔐 Discord Authentication Flow

1. User logs in via Discord OAuth2
2. Selects a server (guild) where the bot is present
3. The backend checks roles (`friend`, `streamer`) from Discord API or PostgreSQL
4. Only authorized users can access the media upload interface

---

### 📤 Features

- Upload images, videos, and audio (.mp3)
- Link support: YouTube, TikTok, Instagram
- Customizable:
  - Caption text
  - Display size
  - Playback duration
- Real-time media sending via Socket.IO
- Animated display in OBS with user nickname and avatar
- Adapted rendering for each media type

---

### 🚀 Run Locally

#### Backend

```bash
cd o7-back
pnpm install
pnpm dev
```

#### Frontend

```bash
cd o7-front
pnpm install
pnpm dev
```

---



# 🎥 07 — Stream Content Upload System

> ⚙️ Projet full-stack pour permettre à mes amis d’envoyer des images, vidéos ou sons pendant mes lives Twitch, qui s’affichent en overlay via OBS — avec pseudo, avatar et effets animés.

---

## 🇫🇷 Présentation

**07** est une application web composée de deux parties :

- 🔙 **Backend (`o7-back`)** : API Express, authentification Discord, Socket.IO pour la communication temps réel avec OBS.
- 💻 **Frontend (`o7-front`)** : Interface Vue 3/Tailwind/GSAP pour uploader des médias et les afficher dans l’overlay.

Le tout est **connecté à Discord** (OAuth2 + rôles) et à un système de **socket temps réel** pour déclencher les contenus en live.

---

### 🧱 Architecture du projet

#### Backend (`o7-back`)
- Node.js + Express
- Socket.IO (Overlay OBS)
- Auth Discord OAuth2
- PostgreSQL (stockage des rôles autorisés)
- Hébergé sur [Railway](https://railway.app/)

```
o7-back/
├── controllers/
├── routes/
├── services/
├── socket/
├── overlay/     ← HTML/JS de l’overlay OBS
├── db/
├── .env
└── server.js
```

#### Frontend (`o7-front`)
- Vue 3 (Composition API)
- TailwindCSS + design personnalisé
- GSAP pour les animations
- Axios + Vue Router
- Hébergé sur [Vercel](https://vercel.com/)

```
o7-front/
├── src/
│   ├── components/
│   ├── pages/
│   ├── router/
│   ├── utils/
│   └── style.css
├── public/
└── .env
```

---

### 🔐 Authentification Discord

1. L’utilisateur se connecte avec Discord via OAuth2
2. Il sélectionne un serveur Discord où le bot est présent
3. Le backend vérifie les rôles (`ami`, `streamer`) via l’API Discord ou la base de données PostgreSQL
4. Seuls les membres autorisés peuvent accéder à l’interface d’upload

---

### 📤 Fonctionnalités

- Upload d’images, vidéos ou fichiers audio (.mp3)
- Envoi de liens (TikTok, YouTube, Instagram…)
- Définition :
  - Légende personnalisée
  - Taille d’affichage
  - Durée de lecture
- Connexion Socket.IO avec OBS
- Apparition animée avec pseudo, avatar, effet de hover, etc.
- Affichage différencié selon le type de média (audio, vidéo, image)

---

### 🚀 Lancer en local

#### Backend

```bash
cd o7-back
pnpm install
pnpm dev
```

#### Frontend

```bash
cd o7-front
pnpm install
pnpm dev
```

---

Made with ❤️ by Zakaria Oubbéa (aka ZakAuMiel).
