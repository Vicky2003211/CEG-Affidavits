import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../css/Navbar.css";  

const FNavbar = () => {
  const [user, setUser] = useState({ name: "", rollNo: "" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser({
        name: storedUser.userName || "Unknown",
        rollNo: storedUser.rollNo || "Unknown",
      });
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="custom-navbar">
      <h2 className="custom-nav-logo">CEG Affidavits</h2>
      
      <div className="custom-nav-left">

        <div className="custom-profile-container" ref={dropdownRef}>
          <FaUserCircle
            className="custom-user-icon"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          {isDropdownOpen && (
            <div className="custom-dropdown">
              <p>Name: {user.name} </p>
              <p>Roll No: {user.rollNo} </p>
              <button className="custom-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default FNavbar;
