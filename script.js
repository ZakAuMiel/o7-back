require('dotenv').config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const shutdownRoutes = require("./routes/ShutdownRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Connexion bot Discord
const { startBot } = require("./services/discordBot");
startBot();

// Permet aux controllers d'accéder à io
app.set("io", io);

// CORS config autorisant le front en local ET en prod
const allowedOrigins = [
  'http://localhost:5173',
  'https://o7-dashboard.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // autorise les requêtes serveur à serveur sans origine
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // ✅ obligatoire sur Render (HTTPS)
      httpOnly: true,
      sameSite: "none", // ✅ pour accepter les cookies cross-origin
      maxAge: 1000 * 60 * 60 * 24, // 1 jour
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", shutdownRoutes);

// Serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
});
