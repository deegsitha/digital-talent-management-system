const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");

// 👥 GET ALL USERS (ADMIN & SYSTEM ADMIN)
router.get("/users/all", async (req, res) => {
  try {
    if (req.user.role !== "system_admin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Management Access Only" });
    }
    const users = await User.find().select("-password").sort({ role: 1, name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ❌ DELETE A USER (SYSTEM ADMIN ONLY)
router.delete("/users/:id", async (req, res) => {
  try {
    if (req.user.role !== "system_admin") {
      return res.status(403).json({ message: "System Admin Authorization Required" });
    }
    const userToWipe = await User.findByIdAndDelete(req.params.id);
    if (!userToWipe) return res.status(404).json({ message: "User not found" });
    
    // Completely physically wipe their assigned tasks to execute "completely from the pages"
    await Task.deleteMany({ userId: req.params.id });
    
    res.json({ message: "User completely erased" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ CREATE TASK
router.post("/add", async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ message: "Unauthorized: Only authorized management can create tasks." });
    }
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      priority: priority || "medium",
      dueDate: dueDate || null,
      userId: assignedTo || req.user.id
    });

    await task.save();
    res.json({ message: "Task created", task });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📋 GET TASKS
router.get("/", async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'system_admin') {
      const tasks = await Task.find().populate('userId', 'name email').sort({ createdAt: -1 });
      return res.json(tasks);
    }
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✏️ UPDATE TASK
router.put("/:id", async (req, res) => {
  try {
    const filter = (req.user.role === 'admin' || req.user.role === 'system_admin') ? { _id: req.params.id } : { _id: req.params.id, userId: req.user.id };
    const updatedTask = await Task.findOneAndUpdate(
      filter,
      req.body,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ message: "Task not found or unauthorized" });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ❌ DELETE TASK
router.delete("/:id", async (req, res) => {
  try {
    const filter = (req.user.role === 'admin' || req.user.role === 'system_admin') ? { _id: req.params.id } : { _id: req.params.id, userId: req.user.id };
    const task = await Task.findOneAndDelete(filter);
    if (!task) return res.status(404).json({ message: "Task not found or unauthorized" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💬 POST A REPLY
router.post("/:id/reply", async (req, res) => {
  try {
    const { text, sender } = req.body;
    if (!text) return res.status(400).json({ message: "Reply text is required" });
    
    const filter = (req.user.role === 'admin' || req.user.role === 'system_admin') 
      ? { _id: req.params.id } 
      : { _id: req.params.id, userId: req.user.id };
      
    const task = await Task.findOneAndUpdate(
      filter,
      { $push: { replies: { text, sender } } },
      { new: true }
    );
    
    if (!task) return res.status(404).json({ message: "Task not found or unauthorized to reply" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;