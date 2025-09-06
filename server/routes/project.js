// import express from "express";
// import Project from "../models/Project.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";


// const router = express.Router();


// // Create Project
// router.post("/", authMiddleware, async (req, res) => {
// const { name } = req.body;
// const project = new Project({ name, members: [req.user.id] });
// await project.save();
// res.json(project);
// });


// // Get all projects user is member of
// router.get("/", authMiddleware, async (req, res) => {
// const projects = await Project.find({ members: req.user.id });
// res.json(projects);
// });

// // get single project
// router.get("/:id", async (req, res) => {
//   const project = await Project.findById(req.params.id)
//     .populate("members", "name email");
//   if (!project) return res.status(404).json({ error: "Not found" });
//   res.json(project);
// });

// // add member
// router.post("/:id/add-member", async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(404).json({ error: "User not found" });

//   const project = await Project.findById(req.params.id);
//   if (!project) return res.status(404).json({ error: "Project not found" });

//   if (!project.members.includes(user._id)) {
//     project.members.push(user._id);
//     await project.save();
//   }
//   const populated = await project.populate("members", "name email");
//   res.json(populated);
// });



// export default router;


import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js"; // Added missing import
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = new Project({ 
      name: name.trim(), 
      members: [req.user.id],
      createdAt: new Date() // Add creation timestamp for sorting
    });
    
    await project.save();
    
    // Populate the creator's info before sending response
    const populatedProject = await project.populate("members", "name email");
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get all projects user is member of
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate("members", "name email")
      .sort({ createdAt: -1 }); // Sort by most recent first
    
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get single project
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is a member of the project
    if (!project.members.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Add member to project
router.post("/:id/add-member", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the requesting user is a member of the project
    if (!project.members.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if user is already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ error: "User is already a member" });
    }

    // Add member
    project.members.push(user._id);
    await project.save();

    // Return populated project
    const populated = await project.populate("members", "name email");
    res.json(populated);
  } catch (error) {
    console.error("Error adding member:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Remove member from project
router.delete("/:id/remove-member", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the requesting user is a member of the project
    if (!project.members.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Don't allow removing the last member
    if (project.members.length === 1) {
      return res.status(400).json({ error: "Cannot remove the last member" });
    }

    // Remove member
    project.members = project.members.filter(
      memberId => memberId.toString() !== userId
    );
    await project.save();

    // Return populated project
    const populated = await project.populate("members", "name email");
    res.json(populated);
  } catch (error) {
    console.error("Error removing member:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// Delete project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the requesting user is a member of the project
    if (!project.members.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Optional: Only allow project creator to delete (if you want this restriction)
    // if (project.members[0].toString() !== req.user.id) {
    //   return res.status(403).json({ error: "Only project creator can delete" });
    // }

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    // Optional: Also delete related tasks if you have a Task model
    // await Task.deleteMany({ projectId: req.params.id });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Update project (bonus feature)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the requesting user is a member of the project
    if (!project.members.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update project
    project.name = name.trim();
    project.updatedAt = new Date();
    await project.save();

    // Return populated project
    const populated = await project.populate("members", "name email");
    res.json(populated);
  } catch (error) {
    console.error("Error updating project:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    res.status(500).json({ error: "Failed to update project" });
  }
});

export default router;