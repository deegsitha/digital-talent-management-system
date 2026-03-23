require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

// ✅ MIDDLEWARE (VERY IMPORTANT ORDER)
app.use(cors());
app.use(express.json()); // ✅ Fix for req.body undefined

// Routes
app.use("/api", authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Server connected
const taskRoutes = require("./routes/task");
const authMiddleware = require("./middleware/auth");

app.use("/api/tasks", authMiddleware, taskRoutes);