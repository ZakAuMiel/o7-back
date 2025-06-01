require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser"); // ✅ Ajouté

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const shutdownRoutes = require("./routes/ShutdownRoutes");

const app = express();
app.set("trust proxy", 1); // Pour accepter les requêtes de proxy (comme sur Render)

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Dossier 'uploads' créé automatiquement.");
}


// Connexion bot Discord
const { startBot } = require("./services/discordBot");
startBot();

// Permet aux controllers d'accéder à io
app.set("io", io);

// CORS config autorisant le front en local ET en prod
const allowedOrigins = [
  "http://localhost:5173",
  "https://o7-dashboard.vercel.app",
  "https://o7-back-production.up.railway.app"
];

// Middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cookieParser()); // ✅ DOIT être placé avant express-session

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // ✅ obligatoire sur Render (HTTPS)
      httpOnly: true,
      sameSite: "none", // ✅ pour accepter les cookies cross-origin (Vercel -> Render)
      maxAge: 1000 * 60 * 60 * 24, // 1 jour
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // autorise les requêtes serveur à serveur sans origine
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", shutdownRoutes);

// Serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

