import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Dashboard.css";

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
    status: "pending"
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      toast.error("Please fill out all fields");
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
      }

      setForm({ title: "", description: "", status: "pending" });
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

  // EDIT POPULATION
  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status || "pending"
    });
    setEditingId(task._id);
    toast("Editing mode active", { icon: "✏️" });
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
    toast("Logged out successfully");
    navigate("/");
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

  const chartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Tasks by Status",
        data: [pendingCount, progressCount, completedCount],
        backgroundColor: [
          'rgba(245, 158, 11, 0.6)', // yellow
          'rgba(56, 189, 248, 0.6)', // blue
          'rgba(16, 185, 129, 0.6)'  // green
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(56, 189, 248, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" } },
      x: { ticks: { color: "#cbd5e1" }, grid: { display: false } }
    },
    plugins: {
      legend: { labels: { color: "#f8fafc" } }
    }
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <h1>Digital Talent</h1>
          <p>Management System</p>
        </div>

        <nav className="nav-menu">
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
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* HEADER */}
        <header className="header">
          <div className="search-bar">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search tasks by title or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="user-profile">
            <span style={{ color: "#94a3b8" }}>Welcome Admin</span>
            <div className="avatar">A</div>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <section className="dashboard-body">
          
          {/* LEFT COL: Add Form & Stats */}
          <div className="left-column">
            
            {/* ADD / EDIT TASK CARD */}
            <div className="glass-card">
              <h2>{editingId ? "✏️ Edit Task" : "✨ Create New Task"}</h2>
              
              <form className="task-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  placeholder="Task Description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                
                {/* Status selector during creation/edit */}
                <select 
                   className="task-form" 
                   style={{ padding: '14px 16px', background: 'rgba(15,23,42,0.5)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                   value={form.status}
                   onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="pending">🟡 Pending</option>
                  <option value="in-progress">🔵 In Progress</option>
                  <option value="completed">🟢 Completed</option>
                </select>

                <button type="submit" className="btn-primary">
                  {editingId ? "Save Changes" : "Submit Task"}
                </button>
                {editingId && (
                  <button type="button" className="btn-icon" onClick={() => { setEditingId(null); setForm({title:"", description:"", status:"pending"}); }}>
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* CHART CARD */}
            <div className="glass-card chart-container">
              <h2>📊 Task Productivity</h2>
              <Bar data={chartData} options={chartOptions} />
            </div>

          </div>

          {/* RIGHT COL: Tasks Grid */}
          <div className="right-column">
            
            <div className="task-grid-header">
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#f8fafc" }}>
                {statusFilter === "all" ? "All Tasks" : `${statusFilter.replace("-", " ")} tasks`}
              </h2>
              <span style={{ color: "#94a3b8" }}>{filteredTasks.length} tasks found</span>
            </div>

            <div className="task-grid">
              {filteredTasks.length === 0 ? (
                <div style={{ color: "#94a3b8", gridColumn: "1 / -1", textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
                  <p style={{ fontSize: "40px", filter: "grayscale(1)" }}>📝</p>
                  <p style={{ marginTop: "10px" }}>No tasks matched your criteria.</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const statusClass = (task.status === "in-progress") ? "progress" : (task.status === "completed" ? "completed" : "pending");
                  
                  return (
                    <div className={`task-item ${statusClass}`} key={task._id}>
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <select 
                          className="status-dropdown"
                          value={task.status || "pending"}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <p>{task.description}</p>
                      
                      <div className="task-actions">
                        <button className="btn-icon edit" onClick={() => handleEdit(task)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-icon delete" onClick={() => deleteTask(task._id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;