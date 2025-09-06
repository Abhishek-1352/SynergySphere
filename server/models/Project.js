import mongoose from "mongoose";


const projectSchema = new mongoose.Schema({
name: String,
members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});


export default mongoose.model("Project", projectSchema);