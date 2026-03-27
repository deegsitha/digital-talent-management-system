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
          'rgba(253, 230, 138, 0.8)', // pastel yellow
          'rgba(191, 219, 254, 0.8)', // pastel blue
          'rgba(167, 243, 208, 0.8)'  // pastel green
        ],
        borderColor: [
          '#facc15',
          '#60a5fa',
          '#34d399'
        ],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
      x: { ticks: { color: "#94a3b8" }, grid: { display: false } }
    },
    plugins: {
      legend: { labels: { color: "#f8fafc", font: { family: "'Inter', sans-serif" } } }
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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
              <h2>{editingId ? "Edit Task" : "Create New Task"}</h2>
              
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
                   className="task-select" 
                   value={form.status}
                   onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
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
              <h2>Task Productivity</h2>
              <Bar data={chartData} options={chartOptions} />
            </div>

          </div>

          {/* RIGHT COL: Tasks Grid */}
          <div className="right-column">
            
            <div className="task-grid-header">
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#f8fafc" }}>
                {statusFilter === "all" ? "All Tasks" : `${statusFilter.replace("-", " ")} tasks`}
              </h2>
            </div>

            <div className="task-grid">
              {filteredTasks.length === 0 ? (
                <div style={{ color: "#94a3b8", gridColumn: "1 / -1", textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
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
                          Edit
                        </button>
                        <button className="btn-icon delete" onClick={() => deleteTask(task._id)}>
                          Delete
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