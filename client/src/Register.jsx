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

      toast.success("Account created 💜");

      navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Create Account 💜</h2>

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
            <span onClick={() => setShowPassword(!showPassword)}>👁️</span>
          </div>

          <button disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

        </form>

        <p onClick={() => navigate("/login")}>
          Already have an account? Login
        </p>

      </div>
    </div>
  );
}

export default Register;