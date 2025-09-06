import express from "express";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();


// Create Task
router.post("/", authMiddleware, async (req, res) => {
const { title, description, assignee, dueDate, project } = req.body;
const task = new Task({ title, description, assignee, dueDate, project });
await task.save();
res.json(task);
});


// Get Tasks by Project
router.get("/:projectId", authMiddleware, async (req, res) => {
const tasks = await Task.find({ project: req.params.projectId }).populate("assignee", "name");
res.json(tasks);
});


export default router;