// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback } from "react";
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
  const [deleting, setDeleting] = useState(null);
  const [newName, setNewName] = useState("");
  const [progressMap, setProgressMap] = useState({});
  const [addMemberProject, setAddMemberProject] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState("recent"); // recent, name, progress
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/projects");
      const projectsData = res.data || [];
      
      // Sort projects by creation date (most recent first)
      const sortedProjects = projectsData.sort((a, b) => 
        new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
      );
      
      setProjects(sortedProjects);
      await loadProgressForProjects(sortedProjects);
    } catch (err) {
      handleRequestError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProgressForProjects = useCallback(async (projectsList) => {
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
      results.forEach(
        (r) => (map[r.projectId] = { total: r.total, done: r.done, pct: r.pct })
      );
      setProgressMap(map);
    } catch (err) {
      console.error("Failed to load project progress", err);
    }
  }, []);

  const createProject = useCallback(async () => {
    if (!newName.trim()) return alert("Enter a project name");
    setCreating(true);
    try {
      const res = await axios.post("/projects", { name: newName.trim() });
      const created = res.data;
      setProjects((prev) => [created, ...prev]);
      setProgressMap((prev) => ({
        ...prev,
        [created._id]: { total: 0, done: 0, pct: 0 },
      }));
      setNewName("");
    } catch (err) {
      handleRequestError(err);
    } finally {
      setCreating(false);
    }
  }, [newName]);

  const deleteProject = useCallback(async (projectId) => {
    if (deleteConfirm !== projectId) {
      setDeleteConfirm(projectId);
      return;
    }

    setDeleting(projectId);
    try {
      await axios.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      setProgressMap((prev) => {
        const newMap = { ...prev };
        delete newMap[projectId];
        return newMap;
      });
      setDeleteConfirm(null);
    } catch (err) {
      handleRequestError(err);
    } finally {
      setDeleting(null);
    }
  }, [deleteConfirm]);

  const handleAddMember = useCallback(async (projectId) => {
    if (!memberEmail.trim()) return alert("Enter member email");
    try {
      const res = await axios.post(`/projects/${projectId}/add-member`, {
        email: memberEmail.trim(),
      });
      const updatedProject = res.data;
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? updatedProject : p))
      );
      setMemberEmail("");
      setAddMemberProject(null);
    } catch (err) {
      handleRequestError(err);
    }
  }, [memberEmail]);

  const sortProjects = useCallback((projectsList, sortType) => {
    const sorted = [...projectsList];
    switch (sortType) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "progress":
        return sorted.sort((a, b) => {
          const progA = progressMap[a._id]?.pct || 0;
          const progB = progressMap[b._id]?.pct || 0;
          return progB - progA;
        });
      case "recent":
      default:
        return sorted.sort((a, b) => 
          new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
        );
    }
  }, [progressMap]);

  const handleRequestError = useCallback((err) => {
    console.error(err);
    const status = err?.response?.status;
    const msg = err?.response?.data?.error || err.message || "Request failed";
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } else {
      alert(msg);
    }
  }, [navigate]);

  const handleKeyPress = useCallback((e, action) => {
    if (e.key === "Enter") {
      action();
    }
  }, []);

  const sortedProjects = sortProjects(projects, sortBy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <Navbar user={user} />

      {/* Create Project Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🚀 Create New Project
        </h3>
        <div className="flex gap-3">
          <input
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, createProject)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
          />
          <button
            onClick={createProject}
            disabled={creating}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-5 py-2 rounded-lg font-medium shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Projects List */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                Loading projects...
              </span>
            ) : `📂 Your Projects (${projects.length})`}
          </h3>

          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A-Z</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          )}
        </div>

        {projects.length === 0 && !loading && (
          <div className="bg-white shadow-md rounded-xl p-8 text-gray-500 text-center border border-gray-100">
            <div className="text-6xl mb-4">📋</div>
            <h4 className="text-lg font-medium mb-2">No projects yet</h4>
            <p>Create your first project using the form above to get started!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((p) => {
            const prog = progressMap[p._id] || { total: 0, done: 0, pct: 0 };
            const isDeleting = deleting === p._id;
            const showDeleteConfirm = deleteConfirm === p._id;

            let progressText = "";
            let progressIcon = "";
            if (prog.total === 0) {
              progressText = "No tasks yet";
              progressIcon = "📝";
            } else if (prog.done === 0) {
              progressText = "Processing...";
              progressIcon = "⏳";
            } else if (prog.done < prog.total) {
              progressText = `${prog.done} of ${prog.total} tasks completed`;
              progressIcon = "📊";
            } else {
              progressText = "All tasks completed";
              progressIcon = "🎉";
            }

            return (
              <div
                key={p._id}
                className="bg-white shadow-md rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 relative overflow-hidden"
              >
                {isDeleting && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-2xl">
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                      Deleting...
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/project/${p._id}`}
                      className="text-lg font-bold text-indigo-600 hover:text-indigo-800 block truncate"
                      title={p.name}
                    >
                      {p.name}
                    </Link>
                    <div className="text-gray-500 text-sm flex items-center gap-1">
                      <span>👥</span>
                      {p.members?.length || 0} member(s)
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <span>{progressIcon}</span>
                      <span className="truncate">{progressText}</span>
                    </div>
                    <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                        style={{ width: `${prog.pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{prog.pct}%</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Link to={`/project/${p._id}`} className="flex-shrink-0">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg font-medium shadow-sm transition-all duration-200 transform hover:scale-105">
                      Open
                    </button>
                  </Link>

                  {addMemberProject === p._id ? (
                    <>
                      <input
                        placeholder="member@example.com"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => handleAddMember(p._id))}
                        className="px-3 py-1 border border-gray-300 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition text-sm"
                      />
                      <button
                        onClick={() => handleAddMember(p._id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddMemberProject(null);
                          setMemberEmail("");
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setAddMemberProject(p._id)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium shadow-sm transition-all duration-200 transform hover:scale-105 flex-shrink-0"
                    >
                      Add Member
                    </button>
                  )}

                  {showDeleteConfirm ? (
                    <>
                      <button
                        onClick={() => deleteProject(p._id)}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 text-sm"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        disabled={isDeleting}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => deleteProject(p._id)}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg font-medium shadow-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex-shrink-0"
                      title="Delete project"
                    >
                      Delete
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
