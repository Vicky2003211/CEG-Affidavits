import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "./Navbar";
import "../css/Categories.css";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import FontAwesome globally

const Categories = () => {
  const [userName, setUserName] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.Role !== "student") {
        // Clear local storage and redirect to login
        localStorage.clear();
        navigate("/");
      } else {
        setUserName(user.userName);
      }
    } else {
      // If no user is found, redirect to login
      navigate("/login");
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [navigate]);

  // Handle Apply Button Click
  const handleApply = (categoryId, categoryName) => {
    navigate(`/StudentLoanForm/${categoryId}`, { state: { categoryName } }); // Pass categoryName via state
  };

  return (
    <div className="categories-body">
      <Navbar />
      <section className="categories-page-section">
        <div className="categories-container">
          <h1 className="text-primary fw-bold">Welcome {userName}! 🎓</h1>
          <h2 className="section-heading">CATEGORIES</h2>
          <h3 className="section-subheading">
            Explore our wide range of Certificates
          </h3>
          <div className="categories-grid">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.categoryId} className="category-card">
                  {/* FontAwesome Icon */}
                  <i className={`fa-solid ${category.icon} category-icon`}></i>
                  <h4 className="category-title">{category.categoryName}</h4>
                  <p className="category-description">{category.description}</p>

                  {/* Apply Button */}
                  <button
                    className="apply-button"
                    onClick={() =>
                      handleApply(category.categoryId, category.categoryName)
                    }
                  >
                    Apply
                  </button>
                </div>
              ))
            ) : (
              <p>Loading categories...</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;
