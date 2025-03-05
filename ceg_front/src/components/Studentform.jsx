import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Studentform.css";
import Navbar from "./Navbar";

const StudentLoanForm = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const categoryName = location.state?.categoryName || "Unknown";
  const navigate = useNavigate();

  // Retrieve user details from local storage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setFormData((prev) => ({
        ...prev,
        name: storedUser.userName || "",
        uroll_no: storedUser.rollNo || "",
        department: storedUser.department || "",
        course: storedUser.course || "",
      }));
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    uroll_no: "",
    father_name: "",
    mother_name: "",
    course: "",
    department: "",
    semester: "",
    email: "",
    document: null,
    categoryId: categoryId,
    categoryName: categoryName,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, document: file });

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "document" && formData[key]) {
        submissionData.append("document", formData[key]);
      } else {
        submissionData.append(key, formData[key]);
      }
    });

    submissionData.append("sentTo", "staff");
    submissionData.append("status", "pending");

    try {
      const response = await fetch("http://localhost:5000/auth/upload", {
        method: "POST",
        body: submissionData,
      });

      if (response.ok) {
        toast.success("Successfully Submitted!");
        setTimeout(() => {
          navigate("/categories");
        }, 5000);
      } else {
        const result = await response.json();
        console.error("Submission failed:", result);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form!");
    }
  };

  return (
    <div className="student-form">
      <Navbar />
      <div className="s-container">
        <h2 className="Studentform-heading">{categoryName} Application Form</h2>
        <form onSubmit={handleSubmit} className="container-card">
          <label className="form-label">Name:</label>
          <input type="text" name="name" value={formData.name} disabled />

          <label className="form-label">Roll Number:</label>
          <input type="text" name="uroll_no" value={formData.uroll_no} disabled />

          <label className="form-label">Father Name:</label>
          <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} required />

          <label className="form-label">Mother Name:</label>
          <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} required />

          <label className="form-label">Course:</label>
          <input type="text" name="course" value={formData.course} disabled />

          <label className="form-label">Department:</label>
          <input type="text" name="department" value={formData.department} disabled />

          <label className="form-label">Semester:</label>
          <input type="number" name="semester" value={formData.semester} onChange={handleChange} required />

          <label className="form-label">Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label className="form-label">Upload Request Letter:</label>
          <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} required />

          {preview && (
            <div className="img-preview">
              <p>Document Preview:</p>
              <img src={preview} alt="Preview" className="img-thumbnail" />
            </div>
          )}

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default StudentLoanForm;
