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
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userName", res.data.user.name);
      toast.success("Login successful");

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
              <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </span>
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