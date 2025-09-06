// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

/**
 * Dashboard
 * - Lists projects the logged-in user is a member of
 * - Allows creating a new project
 * - Shows member count and progress % (based on tasks Done)
 * - Allows adding a member to a project by email
 */

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [progressMap, setProgressMap] = useState({}); // { projectId: { done, total, pct } }
  const [addMemberProject, setAddMemberProject] = useState(null); // projectId currently showing add-member input
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
      // load progress for each project
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
        // API: GET /tasks/:projectId
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
      // not fatal: leave progressMap as-is or empty
    }
  }

  async function createProject() {
    if (!newName.trim()) return alert("Enter a project name");
    setCreating(true);
    try {
      const res = await axios.post("/projects", { name: newName.trim() });
      const created = res.data;
      setProjects((prev) => [created, ...prev]);
      // fetch progress for new project (likely 0)
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
      // response is populated project
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
      // token invalid/expired — redirect to login
      localStorage.removeItem("token");
      navigate("/");
    } else {
      alert(msg);
    }
  }

  return (
    <div className="p-4" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <header className="flex between" style={{ alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>SynergySphere — Projects</h1>
        <div>
          <button onClick={logout} style={{ padding: "8px 12px", borderRadius: 6 }}>
            Logout
          </button>
        </div>
      </header>

      <section className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginTop: 0 }}>Create New Project</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={createProject} disabled={creating} style={{ padding: "8px 14px" }}>
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </section>

      <section>
        <h3 style={{ marginTop: 0 }}>{loading ? "Loading projects..." : `Your Projects (${projects.length})`}</h3>

        {projects.length === 0 && !loading && (
          <div className="card">No projects yet — create one using the form above.</div>
        )}

        <div className="grid" style={{ marginTop: 8 }}>
          {projects.map((p) => {
            const prog = progressMap[p._id] || { total: 0, done: 0, pct: 0 };
            return (
              <div key={p._id} className="card clickable" style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Link to={`/project/${p._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <h4 style={{ margin: "0 0 6px 0" }}>{p.name}</h4>
                    </Link>
                    <div style={{ fontSize: 13, color: "#555" }}>{p.members?.length || 0} member(s)</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, marginBottom: 6 }}>{prog.pct}% done</div>
                    <div style={{ width: 120, height: 8, background: "#eee", borderRadius: 6 }}>
                      <div
                        style={{
                          width: `${prog.pct}%`,
                          height: "100%",
                          borderRadius: 6,
                          background: "#4f46e5",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Link to={`/project/${p._id}`}>
                    <button style={{ padding: "6px 10px" }}>Open</button>
                  </Link>

                  {addMemberProject === p._id ? (
                    <>
                      <input
                        placeholder="member@example.com"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        style={{ padding: 6, flex: 1 }}
                      />
                      <button onClick={() => handleAddMember(p._id)} style={{ padding: "6px 10px" }}>
                        Add
                      </button>
                      <button onClick={() => { setAddMemberProject(null); setMemberEmail(""); }} style={{ padding: "6px 10px" }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setAddMemberProject(p._id)} style={{ padding: "6px 10px" }}>
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
