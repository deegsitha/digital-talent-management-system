const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// ✅ REGISTER API
router.post("/register", async (req, res) => {
  try {
    console.log("BODY:", req.body); // ✅ Debug

    const { name, email, password, role } = req.body || {};

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role && ["admin", "user", "system_admin"].includes(role) ? role : "user"
    });

    await newUser.save();

    res.json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Token
   const token = jwt.sign(
  { id: user._id, role: user.role, name: user.name },   // ✅ MUST BE THIS
  "secretkey"
);

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;