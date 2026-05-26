require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const passport = require("./config/Passport");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Render (și orice hosting cu reverse proxy) trimite X-Forwarded-For
// Fără această linie, express-rate-limit aruncă eroare și blochează toate requesturile
app.set('trust proxy', 1);

connectDB();

// ─── CORS — suportă mai multe origini (localhost + Vercel) ───────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((s) => s.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests fără origin (ex: curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ─── Health check
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Public Routes 

// Auth
app.use("/api/auth", authRoutes);

// Services (public)
app.use("/api/services", require("./routes/Serviceroutes"));

// Team (public)
app.use("/api/team", require("./routes/TeamRoutes"));

// Appointments (public + protected)
app.use("/api/appointments", require("./routes/appointmentRoutes"));

// ─── Protected Routes

// User profile & settings
app.use("/api/user", require("./routes/UserRoutes"));

// ─── Admin Routes 

// Admin routes (services + team + appointments)
app.use("/api/admin", require("./routes/Adminroutes"));

// ─── Error Handlers 

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));