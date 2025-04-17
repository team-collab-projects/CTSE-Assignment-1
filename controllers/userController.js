const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered" });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).json({
      msg: "Server error during registration",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({
      msg: "Server error during login",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ msg: "Server error while fetching users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user by ID:", err.message);
    res.status(500).json({ msg: "Server error while fetching user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Allow only if ID in token matches the ID in the route
    if (req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ msg: "You can only update your own account" });
    }

    const { username, password } = req.body;
    const updatedFields = {};

    if (username) updatedFields.username = username;
    if (password) updatedFields.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User updated", user });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ msg: "Server error while updating user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Allow only if ID in token matches the ID in the route
    if (req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ msg: "You can only delete your own account" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error("❌ Deletion error:", err.message);
    res.status(500).json({ msg: "Server error while deleting user" });
  }
};
