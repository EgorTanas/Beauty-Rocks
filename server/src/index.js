const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoute = require("./routes/authRoutes");

const app = express();

dotenv.config();
connectDB();

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// routes
app.use('/api/auth', userRoute);

app.get("/", (req, res) => {
  res.json({ message: "Server merge!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});