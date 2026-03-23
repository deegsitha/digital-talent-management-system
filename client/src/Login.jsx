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

      // later replace with dashboard
      navigate("/dashboard")

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">

      {/* 🔥 TOP HEADER */}
      <header className="auth-header">
        <h1>Digital Talent Management System</h1>
        <p>Manage talent efficiently </p>
      </header>

      {/* 🔥 CARD */}
      <div className="auth-container">
        <div className="auth-card">

          <h2>Welcome Back</h2>
          <p className="subtitle">Login to continue</p>

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="input-group">
              <input
                type="email"
                name="email"
                required
                placeholder=" "
                onChange={handleChange}
              />
              <label>Email Address</label>
            </div>

            {/* PASSWORD */}
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

            {/* LOGIN BUTTON */}
            <button disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* FOOTER */}
          <p className="switch-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>Register</span>
           
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;