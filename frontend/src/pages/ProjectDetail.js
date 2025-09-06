// src/pages/ProjectDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function ProjectDetails() {
  const { id } = useParams(); // projectId
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // new task form
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignee: "",
  });

  // discussion
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
      const res = await axios.post("/tasks", {
        ...taskForm,
        project: id,
      });
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

  if (loading) return <div className="p-4">Loading project...</div>;
  if (!project) return <div className="p-4">Project not found</div>;

  return (
    <div className="p-4" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>{project.name}</h2>
        <Link to="/dashboard">
          <button style={{ padding: "6px 12px" }}>← Back</button>
        </Link>
      </header>

      {/* TASK LIST */}
      <section className="card" style={{ marginBottom: 20 }}>
        <h3>Tasks</h3>
        <div>
          {tasks.length === 0 && <p>No tasks yet</p>}
          {tasks.map((t) => (
            <div
              key={t._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <div style={{ fontWeight: "bold" }}>{t.title}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{t.description}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Assigned to: {t.assignee?.name || "Unassigned"} | Due:{" "}
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
              </div>
              <div style={{ marginTop: 6 }}>
                <select
                  value={t.status}
                  onChange={(e) => updateStatus(t._id, e.target.value)}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Create Task</h4>
          <input
            placeholder="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            style={{ display: "block", marginBottom: 8, padding: 6 }}
          />
          <textarea
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({ ...taskForm, description: e.target.value })
            }
            style={{ display: "block", marginBottom: 8, padding: 6 }}
          />
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) =>
              setTaskForm({ ...taskForm, dueDate: e.target.value })
            }
            style={{ display: "block", marginBottom: 8, padding: 6 }}
          />
          <select
            value={taskForm.assignee}
            onChange={(e) =>
              setTaskForm({ ...taskForm, assignee: e.target.value })
            }
            style={{ display: "block", marginBottom: 8, padding: 6 }}
          >
            <option value="">Select Assignee</option>
            {project.members?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          <button onClick={createTask} style={{ padding: "6px 12px" }}>
            Add Task
          </button>
        </div>
      </section>

      {/* DISCUSSION */}
      <section className="card">
        <h3>Project Discussion</h3>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 10,
            height: 200,
            overflowY: "auto",
            marginBottom: 10,
          }}
        >
          {messages.length === 0 && <p>No messages yet</p>}
          {messages.map((m) => (
            <div key={m._id} style={{ marginBottom: 8 }}>
              <strong>{m.sender?.name || "User"}:</strong> {m.content}
              <div style={{ fontSize: 11, color: "#777" }}>
                {new Date(m.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Type a message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={{ flex: 1, padding: 6 }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </section>
    </div>
  );
}
