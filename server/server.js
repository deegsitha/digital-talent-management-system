const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");
const authMiddleware = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// 📊 BACKEND ENHANCEMENT: Simple Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api", authRoutes);

// 🔥 TASK ROUTES
app.use("/api/tasks", authMiddleware, taskRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.listen(5001, () => {
  console.log("Server running on port 5001");
});