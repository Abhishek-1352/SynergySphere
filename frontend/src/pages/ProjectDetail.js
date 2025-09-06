// src/pages/ProjectDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignee: "",
  });

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line
  }, [id]);

  async function loadProject() {
    setLoading(true);
    try {
      const res = await axios.get(`/projects/${id}`);
      setProject(res.data);

      const t = await axios.get(`/tasks/${id}`);
      setTasks(t.data);

      const m = await axios.get(`/messages/${id}`);
      setMessages(m.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function createTask() {
    if (!taskForm.title.trim()) return alert("Enter task title");
    try {
      const res = await axios.post("/tasks", { ...taskForm, project: id });
      setTasks((prev) => [...prev, res.data]);
      setTaskForm({ title: "", description: "", dueDate: "", assignee: "" });
    } catch (err) {
      handleError(err);
    }
  }

  async function updateStatus(taskId, newStatus) {
    try {
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      handleError(err);
    }
  }

  async function sendMessage() {
    if (!chatInput.trim()) return;
    try {
      const res = await axios.post(`/messages/${id}`, { content: chatInput });
      setMessages((prev) => [...prev, res.data]);
      setChatInput("");
    } catch (err) {
      handleError(err);
    }
  }

  function handleError(err) {
    console.error(err);
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      alert(err?.response?.data?.error || "Something went wrong");
    }
  }

  // ✅ Badge color helper
  function statusColor(status) {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading)
    return (
      <div className="p-6 text-center text-lg animate-pulse text-indigo-600">
        Loading project...
      </div>
    );
  if (!project) return <div className="p-6 text-center">Project not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-indigo-700">{project.name}</h2>
        <Link to="/dashboard">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition">
            ← Back
          </button>
        </Link>
      </header>

      {/* TASK LIST */}
      <section className="bg-white shadow-lg rounded-2xl p-6 space-y-4 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800">📌 Tasks</h3>
        <div className="space-y-4">
          {tasks.length === 0 && (
            <p className="text-gray-500 italic">No tasks yet</p>
          )}
          {tasks.map((t) => (
            <div
              key={t._id}
              className="p-4 bg-gradient-to-r from-indigo-50 to-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition transform hover:scale-[1.01]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{t.title}</div>
                  <div className="text-sm text-gray-600">{t.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Assigned to: {t.assignee?.name || "Unassigned"} | Due:{" "}
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                    t.status
                  )}`}
                >
                  {t.status}
                </span>
              </div>

              <div className="mt-3">
                <select
                  value={t.status}
                  onChange={(e) => updateStatus(t._id, e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-400"
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE TASK */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-2">➕ Create Task</h4>
          <input
            placeholder="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({ ...taskForm, description: e.target.value })
            }
            className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) =>
              setTaskForm({ ...taskForm, dueDate: e.target.value })
            }
            className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={taskForm.assignee}
            onChange={(e) =>
              setTaskForm({ ...taskForm, assignee: e.target.value })
            }
            className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select Assignee</option>
            {project.members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          <button
            onClick={createTask}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition transform hover:scale-105"
          >
            Add Task
          </button>
        </div>
      </section>

      {/* DISCUSSION */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          💬 Project Discussion
        </h3>
        <div className="border border-gray-200 rounded-lg p-3 h-60 overflow-y-auto mb-4 bg-gradient-to-br from-gray-50 to-white">
          {messages.length === 0 && (
            <p className="text-gray-500 italic">No messages yet</p>
          )}
          {messages.map((m) => (
            <div key={m._id} className="mb-3 animate-fadeIn">
              <strong className="text-indigo-600">{m.sender?.name || "User"}:</strong>{" "}
              <span className="text-gray-700">{m.content}</span>
              <div className="text-xs text-gray-400">
                {new Date(m.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Type a message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition transform hover:scale-105"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
