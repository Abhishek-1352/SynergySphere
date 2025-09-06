import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
title: String,
description: String,
assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
dueDate: Date,
status: { type: String, enum: ["To Do", "In Progress", "Done"], default: "To Do" },
project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
});


export default mongoose.model("Task", taskSchema);