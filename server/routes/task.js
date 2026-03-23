const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// ➕ CREATE TASK
router.post("/add", async (req, res) => {
  try {
    const { title, description } = req.body;

    const task = new Task({
      title,
      description,
      userId: req.user.id
    });

    await task.save();
    res.json({ message: "Task created", task });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📋 GET ALL TASKS
router.get("/", async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});


// ✏️ UPDATE TASK
router.put("/:id", async (req, res) => {
  const updated = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});


// ❌ DELETE TASK
router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

module.exports = router;