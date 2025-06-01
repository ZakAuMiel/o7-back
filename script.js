require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const shutdownRoutes = require("./routes/ShutdownRoutes");

const app = express();
app.set("trust proxy", 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.engine.on("headers", (headers) => {
  headers["Access-Control-Allow-Origin"] = "*";
});

// Création du dossier uploads si besoin
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Dossier 'public/uploads' créé.");
}

// 🤖 Démarre le bot Discord
const { startBot } = require("./services/discordBot");
startBot();

// Injecte io dans Express pour usage dans controllers
app.set("io", io);

// Origines autorisées
const allowedOrigins = [
  "http://localhost:5173",
  "https://o7-dashboard.vercel.app",
  "https://o7-back-production.up.railway.app"
];

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 86400000
    },
  })
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin === "null") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// 🗂️ Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", shutdownRoutes);

// 📂 Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/overlay", express.static(path.join(__dirname, "public/overlay")));

// 🚀 Démarrage
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
