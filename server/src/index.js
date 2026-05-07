const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db")
const dotenv = require("dotenv")


dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 5000
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Server merge!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});