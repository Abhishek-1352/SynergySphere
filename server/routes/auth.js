import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


const router = express.Router();


// Signup
router.post("/signup", async (req, res) => {
try {
const { name, email, password } = req.body;
const existing = await User.findOne({ email });
if (existing) return res.status(400).json({ error: "User already exists" });


const hashed = await bcrypt.hash(password, 10);
const user = new User({ name, email, password: hashed });
await user.save();
res.json({ msg: "User registered" });
} catch (err) {
res.status(400).json({ error: err.message });
}
});


// Login
router.post("/login", async (req, res) => {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ error: "User not found" });


const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ error: "Invalid password" });


const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});




export default router;