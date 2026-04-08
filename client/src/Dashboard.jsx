import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Dashboard.css";
import ThemeToggle from "./ThemeToggle";

// Chart
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "pending",
    priority: "medium",
    dueDate: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});



  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "user";
  const userName = localStorage.getItem("userName") || "User";

  // Authentication Check
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // FETCH TASKS
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tasks", {
        headers: { Authorization: token }
      });
      setTasks(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load tasks");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tasks/users/all", {
        headers: { Authorization: token }
      });
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      if (role === 'system_admin' || role === 'admin') fetchUsers();
    }
  }, [token, role]);

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      toast.error("Please fill out required fields");
      return;
    }

    if (!form.assignedTo) {
      toast.error("Please assign the task to a user");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5001/api/tasks/${editingId}`,
          form,
          { headers: { Authorization: token } }
        );
        toast.success("Task updated");

        setEditingId(null);
      } else {
        await axios.post(
          "http://localhost:5001/api/tasks/add",
          form,
          { headers: { Authorization: token } }
        );
        toast.success("Task created");
        const assignee = users.find(u => u._id === form.assignedTo);
        const assigneeName = assignee ? assignee.name : "a user";

      }

      setForm({ title: "", description: "", assignedTo: "", status: "pending", priority: "medium", dueDate: "" });
      fetchTasks();
    } catch (err) {
      console.log(err);
      toast.error("Failed to save task");
    }
  };

  // DELETE
  const deleteTask = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this task?")) {
        await axios.delete(`http://localhost:5001/api/tasks/${id}`, {
          headers: { Authorization: token }
        });
        toast.success("Task deleted");
        fetchTasks();
      }
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  // SYSTEM ADMIN - DELETE USER ENTIRELY
  const deleteSystemUser = async (userId) => {
    if (!window.confirm("FATAL WARNING: This will permanently wipe this User and permanently delete every single task currently assigned to them from this application. ONLY proceed if you are sure!")) return;
    try {
      await axios.delete(`http://localhost:5001/api/tasks/users/${userId}`, {
        headers: { Authorization: token },
      });
      toast.success("User and all bound tasks completely erased.");
      fetchUsers();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to erase user");
    }
  };

  // EDIT POPULATION
  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      assignedTo: task.userId ? task.userId._id : "",
      status: task.status || "pending",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
    });
    setEditingId(task._id);
    toast("Editing mode active");
  };

  // UPDATE STATUS ONLY
  const handleStatusChange = async (task, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5001/api/tasks/${task._id}`,
        { ...task, status: newStatus },
        { headers: { Authorization: token } }
      );
      toast.success(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    toast("Logged out successfully");
    navigate("/");
  };

  // SEND REPLY
  const handleReplySubmit = async (e, taskId) => {
    e.preventDefault();
    const text = replyTexts[taskId];
    if (!text) return;

    try {
      await axios.post(
        `http://localhost:5001/api/tasks/${taskId}/reply`,
        { text, sender: userName },
        { headers: { Authorization: token } }
      );
      setReplyTexts(prev => ({ ...prev, [taskId]: "" }));
      fetchTasks();
    } catch (err) {
      toast.error("Failed to post reply");
    }
  };

  // FILTER & SEARCH LOGIC
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || (task.status || "pending") === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  // CHART DATA
  const pendingCount = tasks.filter(t => (t.status || "pending") === "pending").length;
  const progressCount = tasks.filter(t => t.status === "in-progress").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const chartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Tasks by Status",
        data: [pendingCount, progressCount, completedCount],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',  // Yellow
          'rgba(255, 107, 0, 0.8)',  // Orange
          'rgba(16, 185, 129, 0.8)'  // Green
        ],
        borderColor: [
          '#ca8a04',
          '#ff6b00',
          '#059669'
        ],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { ticks: { color: "#888888" }, grid: { color: "rgba(255,255,255,0.05)" } },
      x: { ticks: { color: "#888888" }, grid: { display: false } }
    },
    plugins: {
      legend: { labels: { color: "#ffffff", font: { family: "'Inter', sans-serif" } } }
    }
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* PROFESSIONAL SIDEBAR (Admin / System Admin Only) */}
      {(role === 'admin' || role === 'system_admin') && (
        <aside className="sidebar">
          <div className="brand">
            <h1>Digital Talent</h1>
            <p>Management Platform</p>
          </div>

          <nav className="nav-menu">
            {role === 'system_admin' ? (
              <>
                <div className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
                  <span>Analytics Center</span>
                </div>
                <div className={`nav-item ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
                  <span>User Management</span>
                </div>
                <div className={`nav-item ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
                  <span>Task Monitoring</span>
                </div>
                <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
                  <span>System Controls</span>
                </div>
              </>
            ) : (
              <>
                <div className={`nav-item ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>
                  <span>All Tasks</span>
                  <span className="badge">{tasks.length}</span>
                </div>
                <div className={`nav-item ${statusFilter === "pending" ? "active" : ""}`} onClick={() => setStatusFilter("pending")}>
                  <span>Pending</span>
                  <span className="badge">{pendingCount}</span>
                </div>
                <div className={`nav-item ${statusFilter === "in-progress" ? "active" : ""}`} onClick={() => setStatusFilter("in-progress")}>
                  <span>In Progress</span>
                  <span className="badge">{progressCount}</span>
                </div>
                <div className={`nav-item ${statusFilter === "completed" ? "active" : ""}`} onClick={() => setStatusFilter("completed")}>
                  <span>Completed</span>
                  <span className="badge">{completedCount}</span>
                </div>
              </>
            )}
          </nav>

          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* HEADER */}
        <header className="header">
          <div className="search-bar">
            {/* Search Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="user-profile">
            <ThemeToggle className="header-theme-toggle" />

            <div className="user-info-text">
              <span className="user-name">Welcome, {userName}</span>
              <span className="user-role-badge">
                {role === "system_admin" ? "System Admin" : role === "admin" ? "Admin" : "User"}
              </span>
            </div>
            <div className="avatar">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <button className="logout-btn-header logout-btn" onClick={handleLogout} style={{marginLeft:'8px', padding:'8px 16px', marginTop: 0}}>
              Sign Out
            </button>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <section className="dashboard-body">

          {/* ========================================================= */}
          {/* TAB 1: USER MANAGEMENT (SYSTEM ADMIN)                     */}
          {/* ========================================================= */}
          {role === 'system_admin' && activeTab === 'users' && (
            <div className="pro-card tab-module">
              <h2>Platform Users</h2>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th style={{textAlign:'right'}}>System Action</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                       <td>{u.name}</td>
                       <td>{u.email}</td>
                       <td>{u.role.toUpperCase()}</td>
                       <td style={{textAlign:'right'}}>
                         {u.role !== 'system_admin' && (
                           <button onClick={() => deleteSystemUser(u._id)} className="btn-action delete" style={{padding:'6px 15px'}}>
                             WIPE USER
                           </button>
                         )}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SYSTEM SETTINGS (SYSTEM ADMIN)                     */}
          {/* ========================================================= */}
          {role === 'system_admin' && activeTab === 'settings' && (
            <div className="tab-module">
              <h2 style={{fontSize: '20px', color: 'var(--text-h)', marginBottom: '20px', fontWeight: '600'}}>System Controls</h2>
              <div className="system-controls-grid">
                <div className="pro-card control-card"><p>Maintenance Mode</p><input type="checkbox"/></div>
                <div className="pro-card control-card"><p>Open Enrollment</p><input type="checkbox" defaultChecked/></div>
                <div className="pro-card control-card"><p>Force MFA</p><input type="checkbox"/></div>
                <div className="pro-card control-card"><p>Enable Audit Logs</p><input type="checkbox" defaultChecked/></div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: DASHBOARD ANALYTICS (SYSTEM ADMIN)                 */}
          {/* ========================================================= */}
          {role === 'system_admin' && activeTab === 'dashboard' && (
            <div className="tab-module">
              <div className="system-controls-grid" style={{marginBottom:'30px'}}>
                <div className="pro-card control-card" style={{flexDirection:'column', alignItems:'flex-start'}}>
                  <h3 style={{fontSize:'12px', color:'var(--text-muted)', textTransform:'uppercase'}}>Total Platform Users</h3>
                  <p style={{fontSize:'32px', color:'var(--text-h)', margin:'10px 0 0 0'}}>{users.length}</p>
                </div>
                <div className="pro-card control-card" style={{flexDirection:'column', alignItems:'flex-start', borderLeft: '6px solid var(--accent)'}}>
                  <h3 style={{fontSize:'12px', color:'var(--accent)', textTransform:'uppercase', fontWeight: '800'}}>Global Tasks</h3>
                  <p style={{fontSize:'36px', color:'var(--text-h)', margin:'10px 0 0 0', fontWeight: '900'}}>{totalTasks}</p>
                </div>
                <div className="pro-card control-card" style={{flexDirection:'column', alignItems:'flex-start', borderLeft: '6px solid var(--accent-hover)'}}>
                  <h3 style={{fontSize:'12px', color:'var(--accent-hover)', textTransform:'uppercase', fontWeight: '800'}}>Completion Rate</h3>
                  <p style={{fontSize:'36px', color:'var(--text-h)', margin:'10px 0 0 0', fontWeight: '900'}}>{completionRate}%</p>
                </div>
              </div>
              <div className="pro-card chart-container">
                <h2>Global Task Status</h2>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* THE MAIN TASK BOARD (Users + Admins + SysAdmin Task Tab)  */}
          {/* ========================================================= */}
          {((role !== 'system_admin') || (role === 'system_admin' && activeTab === 'tasks')) && (
            <div className={role === 'user' ? "full-width-feed tab-module" : "tab-module"}>

          {/* TOP QUICK ADD BAR & EDIT MODAL */}
          {(role === 'admin' || role === 'system_admin' || editingId) && (
            <div className="quick-add-bar pro-card">
              <h2>{editingId ? "Edit Task" : "Quick Add Task"}</h2>
              <form className="quick-add-form" onSubmit={handleSubmit}>
                <div className="dash-input-group" style={{ gridArea: 'title' }}>
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Task Title..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="dash-input-group" style={{ gridArea: 'desc' }}>
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Short Description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="dash-input-group" style={{ gridArea: 'assignee' }}>
                  <label>Assignee</label>
                  <select 
                     className="task-select" 
                     value={form.assignedTo}
                     onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  >
                    <option value="" disabled>User...</option>
                    {users.filter(u => u.role === 'user' || u.role === 'admin').map(u => (
                       <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="dash-input-group" style={{ gridArea: 'status' }}>
                  <label>Status</label>
                  <select 
                     className="task-select" 
                     value={form.status}
                     onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="dash-input-group" style={{ gridArea: 'priority' }}>
                  <label>Priority</label>
                  <select 
                     className="task-select" 
                     value={form.priority}
                     onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="dash-input-group" style={{ gridArea: 'due' }}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
                <div className="form-actions" style={{ gridArea: 'actions', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn-primary" style={{ flex: '0 1 150px' }}>
                    {editingId ? "Save Edit" : "Add Task"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm({title:"", description:"", assignedTo:"", status:"pending", priority:"medium", dueDate:""}); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          
          <div className={(role === 'admin' || role === 'user') ? "content-split" : "full-width-feed"}>
            {/* LEFT COL: Stats (Analytics) */}
            {(role === 'admin' || role === 'user') && (
              <div className="left-column">
                <div className="pro-card chart-container">
                  <h2 style={{ color: 'var(--accent)' }}>Analytics Overview</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                     <div style={{ background: 'var(--accent-bg)', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--accent-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase' }}>Scope</p>
                        <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-h)' }}>{totalTasks}</p>
                     </div>
                     <div style={{ background: 'var(--accent-bg)', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--accent-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--accent-hover)', fontWeight: '800', textTransform: 'uppercase' }}>Efficiency</p>
                        <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-h)' }}>{completionRate}%</p>
                     </div>
                  </div>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

          {/* RIGHT COL: Task Grid */}
          <div className="right-column">
            
            <div className="task-grid-header">
              <h2>{role === "user" ? "My Assigned Tasks" : (statusFilter === "all" ? "All Tasks" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("-", " ")} Tasks`)}</h2>
            </div>

            <div className="task-grid" style={role === 'user' ? {gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'} : {}}>
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                   <p>No tasks matched your criteria.</p>
                </div>
              ) : (
                filteredTasks.map((task, index) => {
                  const statusClass = (task.status === "in-progress") ? "progress" : (task.status === "completed" ? "completed" : "pending");
                  
                  return (
                    <div className={`pro-card task-card ${statusClass}`} key={task._id}>
                      <div className="task-card-header">
                        <div className="title-wrapper">
                          <span className={`status-dot ${statusClass}`}></span>
                          <h3>{task.title}</h3>
                          <span className={`priority-badge ${task.priority || "medium"}`}>{task.priority || "medium"}</span>
                        </div>
                        <select 
                          className="status-dropdown"
                          value={task.status || "pending"}
                          style={{
                            background: task.status === 'completed' ? 'var(--success)' : task.status === 'in-progress' ? 'var(--accent)' : 'var(--warning)',
                            color: 'var(--bg)',
                            fontWeight: '800',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '50px'
                          }}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div className="task-card-body">
                        {(role === "admin" || role === "system_admin") && task.userId && (
                          <div className="admin-badge">
                            Assigned User: {task.userId.name}
                          </div>
                        )}
                        <div className="description-box">
                          <span className="desc-label">Task Description</span>
                          <p>{task.description}</p>
                          {task.dueDate && (
                             <div style={{marginTop: '10px', fontSize: '11px', color: '#00C896', fontWeight: 'bold'}}>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                             </div>
                          )}
                        </div>
                        {role === "user" && (
                           <div className="admin-badge" style={{marginTop:'10px', display:'block', background:'transparent', border: '1px dashed #1B2F24', textAlign:'center', color: '#a0a0a0'}}>
                              Created: {new Date(task.createdAt).toLocaleDateString()}
                           </div>
                        )}
                      </div>
                      
                      <div className="task-card-footer">
                        {/* THE REPLY FEED */}
                        <div className="replies-section" style={{background:'var(--bg)', padding:'10px', borderRadius:'6px', border:'1px solid var(--border)', marginBottom:'15px'}}>
                          {task.replies && task.replies.length > 0 ? (
                            <div className="replies-list" style={{maxHeight:'100px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'5px', marginBottom:'10px'}}>
                              {task.replies.map((reply, i) => (
                                <div key={i} style={{fontSize:'13px', padding:'6px', background: reply.sender === userName ? 'var(--bg-secondary)' : 'var(--bg-tertiary)', border:'1px solid var(--border)', borderRadius:'4px'}}>
                                  <span style={{fontWeight:'600', color:'var(--accent)', marginRight:'5px'}}>{reply.sender}:</span>
                                  <span style={{color:'var(--text)'}}>{reply.text}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{fontSize:'12px', color:'var(--text-muted)', fontStyle:'italic', textAlign:'center', margin:'0 0 10px 0'}}>No status notes yet.</p>
                          )}
                          {role === 'user' && (
                            <form className="reply-form" onSubmit={(e) => handleReplySubmit(e, task._id)} style={{display:'flex', gap:'5px', marginTop:'5px'}}>
                               <input 
                                 type="text"
                                 placeholder="Send a status update..."
                                 value={replyTexts[task._id] || ""}
                                 onChange={e => setReplyTexts({...replyTexts, [task._id]: e.target.value})}
                                 style={{flex:1, padding:'8px', borderRadius:'4px', fontSize:'13px'}}
                               />
                               <button type="submit" style={{padding:'8px 12px', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'13px', fontWeight: 'bold'}}>Send</button>
                            </form>
                          )}
                        </div>
                        
                        {/* TASK CONTROLS */}
                        {role !== 'user' && (
                          <div className="task-actions-box" style={{display:'flex', gap:'10px', width:'100%', background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:'6px', padding:'10px', marginTop:'15px'}}>
                            <button className="btn-action edit" onClick={() => handleEdit(task)}>
                              Edit Task
                            </button>
                            <button className="btn-action delete" onClick={() => deleteTask(task._id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
          </div>
          </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
