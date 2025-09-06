import express from "express";
import Project from "../models/Project.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();


// Create Project
router.post("/", authMiddleware, async (req, res) => {
const { name } = req.body;
const project = new Project({ name, members: [req.user.id] });
await project.save();
res.json(project);
});


// Get all projects user is member of
router.get("/", authMiddleware, async (req, res) => {
const projects = await Project.find({ members: req.user.id });
res.json(projects);
});

// get single project
router.get("/:id", async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("members", "name email");
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

// add member
router.post("/:id/add-member", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });

  if (!project.members.includes(user._id)) {
    project.members.push(user._id);
    await project.save();
  }
  const populated = await project.populate("members", "name email");
  res.json(populated);
});



export default router;