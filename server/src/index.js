require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");

const app = express();
connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Auth
app.use("/api/auth", authRoutes);

// Services (public)
app.use("/api/services", require("./routes/serviceRoutes"));

// Team (public)
app.use("/api/team", require("./routes/teamRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

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