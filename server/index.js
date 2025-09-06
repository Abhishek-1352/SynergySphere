import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
import messageRoutes from "./routes/message.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Atlas connected"))
.catch(err => console.error(err));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));