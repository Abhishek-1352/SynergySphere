import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
content: String,
timestamp: { type: Date, default: Date.now },
});


export default mongoose.model("Message", messageSchema);