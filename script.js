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
  cors: {
    origin: "*", // Autorise tous les domaines pour Socket.IO
    methods: ["GET", "POST"]
  }
});

// 🔁 Fix CORS pour overlay sans Origin (null ou undefined)
io.engine.on("headers", (headers) => {
  headers["Access-Control-Allow-Origin"] = "*";
});

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Dossier 'uploads' créé automatiquement.");
}

// 🤖 Bot Discord
const { startBot } = require("./services/discordBot");
startBot();

// 🔌 Socket.io accessible dans les controllers
app.set("io", io);

// 🌍 Origines autorisées (front et overlay)
const allowedOrigins = [
  "http://localhost:5173",
  "https://o7-dashboard.vercel.app",
  "https://o7-back-production.up.railway.app"
];

// 📦 Middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/Overlay", express.static(path.join(__dirname, "public/Overlay")));

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
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// 🛡️ CORS HTTP Express
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin === "null") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// 📁 Routes API
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", shutdownRoutes);

// 🚀 Lancement serveur
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
