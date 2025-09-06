import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// get all messages for a project
router.get("/:projectId", async (req, res) => {
  const messages = await Message.find({ project: req.params.projectId })
    .populate("sender", "name email");
  res.json(messages);
});

// post a message in a project
router.post("/:projectId", async (req, res) => {
  try {
    const userId = req.user?.id; // from JWT middleware if you use it
    const { content } = req.body;
    const msg = new Message({
      sender: userId,
      project: req.params.projectId,
      content,
    });
    await msg.save();
    const populated = await msg.populate("sender", "name email");
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
