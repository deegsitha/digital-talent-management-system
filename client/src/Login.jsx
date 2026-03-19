import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/api/login", form);

      localStorage.setItem("token", res.data.token);
      toast.success("Login successful 💜");

      // temporary redirect (no dashboard yet)
      window.location.reload();

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">

  {/* 🔥 TOP HEADER */}
  <h1 className="main-title">Digital Talent Management System</h1>

  <div className="auth-card">

    <h2>Welcome Back 💜</h2>

    <form onSubmit={handleSubmit}>

       

          <div className="input-group">
            <input
              type="email"
              name="email"
              required
              placeholder=" "
              onChange={handleChange}
            />
            <label>Email</label>
          </div>

          <div className="input-group password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder=" "
              onChange={handleChange}
            />
            <label>Password</label>
            <span onClick={() => setShowPassword(!showPassword)}>👁️</span>
          </div>

          <button disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p onClick={() => navigate("/register")}>
          Don't have an account? Register
        </p>

      </div>
    </div>
  );
}

export default Login;