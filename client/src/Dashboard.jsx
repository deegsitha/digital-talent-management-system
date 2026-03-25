import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
    description: ""
  });
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // FETCH TASKS
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tasks", {
        headers: { Authorization: token }
      });
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description) return;

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5001/api/tasks/${editingId}`,
          form,
          { headers: { Authorization: token } }
        );
        setEditingId(null);
      } else {
        await axios.post(
          "http://localhost:5001/api/tasks/add",
          form,
          { headers: { Authorization: token } }
        );
      }

      setForm({ title: "", description: "" });
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE
  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5001/api/tasks/${id}`, {
      headers: { Authorization: token }
    });
    fetchTasks();
  };

  // EDIT
  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description
    });
    setEditingId(task._id);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // CHART DATA
  const chartData = {
    labels: ["Tasks"],
    datasets: [
      {
        label: "Total Tasks",
        data: [tasks.length],
      }
    ]
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="header">
        <h1>Digital Talent Management System</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="main">

        {/* LEFT SIDE */}
        <div className="left">

          {/* FORM */}
          <div className="card form-card">
            <h2>{editingId ? "Edit Task" : "Create Task"}</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Task Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <textarea
                placeholder="Task Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <button type="submit">
                {editingId ? "Update Task" : "Add Task"}
              </button>
            </form>
          </div>

          {/* CHART */}
          <div className="card chart-card">
            <h2>Task Overview</h2>
            <Bar data={chartData} />
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="right">

          <div className="card task-card-container">
            <h2>Task List</h2>

            <div className="task-grid">
              {tasks.length === 0 ? (
                <p className="empty">No tasks available</p>
              ) : (
                tasks.map((task) => (
                  <div className="task-card" key={task._id}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>

                    <div className="actions">
                      <button onClick={() => handleEdit(task)}>
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;