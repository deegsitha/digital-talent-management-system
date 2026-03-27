import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
      await axios.post("http://localhost:5001/api/register", form);

      toast.success("Account created");

      navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <header className="auth-header">
        <h1>Join the Platform</h1>
        <p>Register to get started</p>
      </header>

      <div className="auth-container">
        <div className="auth-card">

          <h2>Create Account</h2>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <input
                type="text"
                name="name"
                required
                placeholder=" "
                onChange={handleChange}
              />
              <label>Full Name</label>
            </div>

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
              <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </span>
            </div>

            <button disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>

          </form>

          <p className="switch-text" onClick={() => navigate("/login")}>
            Already have an account? <span>Login</span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;
//Register component created