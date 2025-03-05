import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/Login.css";

const Login = () => {
  const [uroll_no, setURollNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token expiration on page load
    const token = localStorage.getItem("token");
    console.log(token)
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 2000 < Date.now()) {
        handleLogout();
      } else {
        setAutoLogout(decodedToken.exp);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        uroll_no,
        password,
      });

      if (response.data.success) {
        const { token, payload } = response.data;

        // Save token & user data in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(payload));

        setError("");

        // Decode JWT to get expiration time
        const decodedToken = jwtDecode(token);
        setAutoLogout(decodedToken.exp);

        // Redirect based on role
        if (payload.Role === "student") {
          navigate("/categories");
        } else if (["staff", "HOD", "Admin"].includes(payload.Role)) {
          navigate("/Facultyadvisor");
        } else {
          setError("Invalid role detected!");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const setAutoLogout = (exp) => {
    const timeLeft = exp * 1000 - Date.now();
    setTimeout(() => {
      handleLogout();
    }, timeLeft);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Your Account</h2>

        <div className="form-group">
          <label>Roll Number</label>
          <input
            type="text"
            placeholder="Enter your roll number"
            value={uroll_no}
            onChange={(e) => setURollNo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="forgot-password">
          <a href="#">Forgot Password?</a>
        </div>

        <button className="login-button" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;
