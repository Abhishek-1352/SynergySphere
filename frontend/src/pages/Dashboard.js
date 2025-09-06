// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
});

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [progressMap, setProgressMap] = useState({});
  const [addMemberProject, setAddMemberProject] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await axios.get("/projects");
      setProjects(res.data || []);
      loadProgressForProjects(res.data || []);
    } catch (err) {
      handleRequestError(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProgressForProjects(projectsList) {
    if (!projectsList || projectsList.length === 0) {
      setProgressMap({});
      return;
    }
    try {
      const promises = projectsList.map(async (p) => {
        const r = await axios.get(`/tasks/${p._id}`);
        const tasks = r.data || [];
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === "Done").length;
        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
        return { projectId: p._id, total, done, pct };
      });

      const results = await Promise.all(promises);
      const map = {};
      results.forEach((r) => (map[r.projectId] = { total: r.total, done: r.done, pct: r.pct }));
      setProgressMap(map);
    } catch (err) {
      console.error("Failed to load project progress", err);
    }
  }

  async function createProject() {
    if (!newName.trim()) return alert("Enter a project name");
    setCreating(true);
    try {
      const res = await axios.post("/projects", { name: newName.trim() });
      const created = res.data;
      setProjects((prev) => [created, ...prev]);
      setProgressMap((prev) => ({ ...prev, [created._id]: { total: 0, done: 0, pct: 0 } }));
      setNewName("");
    } catch (err) {
      handleRequestError(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleAddMember(projectId) {
    if (!memberEmail.trim()) return alert("Enter member email");
    try {
      const res = await axios.post(`/projects/${projectId}/add-member`, { email: memberEmail.trim() });
      const updatedProject = res.data;
      setProjects((prev) => prev.map((p) => (p._id === projectId ? updatedProject : p)));
      setMemberEmail("");
      setAddMemberProject(null);
    } catch (err) {
      handleRequestError(err);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function handleRequestError(err) {
    console.error(err);
    const status = err?.response?.status;
    const msg = err?.response?.data?.error || err.message || "Request failed";
    if (status === 401) {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      alert(msg);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <Navbar user={user} />

      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SynergySphere — Projects</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
        >
          Logout
        </button>
      </header>

      {/* Create Project Card */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 animate-fadeIn">
        <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
        <div className="flex gap-3">
          <input
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
          />
          <button
            onClick={createProject}
            disabled={creating}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Projects List */}
      <section>
        <h3 className="text-xl font-semibold mb-4">
          {loading ? "Loading projects..." : `Your Projects (${projects.length})`}
        </h3>

        {projects.length === 0 && !loading && (
          <div className="bg-white shadow-md rounded-xl p-4 animate-fadeIn">
            No projects yet — create one using the form above.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const prog = progressMap[p._id] || { total: 0, done: 0, pct: 0 };
            return (
              <div
                key={p._id}
                className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl transition-transform transform hover:scale-105 animate-fadeIn"
              >
                {/* Project Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Link to={`/project/${p._id}`} className="text-lg font-semibold hover:text-indigo-500">
                      {p.name}
                    </Link>
                    <div className="text-gray-500 text-sm">{p.members?.length || 0} member(s)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm mb-1">{prog.pct}% done</div>
                    <div className="w-28 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${prog.pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link to={`/project/${p._id}`}>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105">
                      Open
                    </button>
                  </Link>

                  {addMemberProject === p._id ? (
                    <>
                      <input
                        placeholder="member@example.com"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
                      />
                      <button
                        onClick={() => handleAddMember(p._id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddMemberProject(null);
                          setMemberEmail("");
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setAddMemberProject(p._id)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105"
                    >
                      Add Member
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
