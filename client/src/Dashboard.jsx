import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: ""
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5001/api/tasks", {
      headers: { Authorization: token }
    });
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5001/api/tasks/add",
      form,
      { headers: { Authorization: token } }
    );

    setForm({ title: "", description: "" });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5001/api/tasks/${id}`, {
      headers: { Authorization: token }
    });
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>DTMS</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li>Tasks</li>
          <li>Settings</li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main">

        {/* NAVBAR */}
        <div className="navbar">
          <h1>Digital Talent Management System</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* TASK FORM */}
        <div className="task-form">
          <h3>Create Task</h3>

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Task Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <input
              placeholder="Task Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button>Add Task</button>
          </form>
        </div>

        {/* TASK LIST */}
        <div className="task-grid">
          {tasks.map((task) => (
            <div className="task-card" key={task._id}>
              <h4>{task.title}</h4>
              <p>{task.description}</p>

              <span className="status">Pending</span>

              <button onClick={() => deleteTask(task._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;