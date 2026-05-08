const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db")
const dotenv = require("dotenv")
const userRoute = require("./routes/authRoutes")
const app = express();

app.use(express.json()); 
dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "Server merge!" });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use('/api/auth/', userRoute)