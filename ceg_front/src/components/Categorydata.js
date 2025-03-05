const categoriesData = [
    {
      id: 1,
      title: "E-Commerce",
      description: "Explore online shopping platforms and services.",
      icon: "fa-shopping-cart",
    },
    {
      id: 2,
      title: "Responsive Design",
      description: "Learn to create mobile-friendly websites.",
      icon: "fa-laptop",
    },
    {
      id: 3,
      title: "Web Security",
      description: "Understand cybersecurity and best practices.",
      icon: "fa-lock",
    },
    {
      id: 4,
      title: "Data Science",
      description: "Analyze data and build AI models.",
      icon: "fa-chart-line",
    },
    {
      id: 5,
      title: "Cloud Computing",
      description: "Deploy and manage applications on the cloud.",
      icon: "fa-cloud",
    },
    {
        id: 6,
        title: "Cloud Computing",
        description: "Deploy and manage applications on the cloud.",
        icon: "fa-cloud",
      },
      {
        id: 7,
        title: "Cloud Computing",
        description: "Deploy and manage applications on the cloud.",
        icon: "fa-cloud",
      },
      {
        id: 8,
        title: "Cloud Computing",
        description: "Deploy and manage applications on the cloud.",
        icon: "fa-cloud",
      },
      {
        id: 9,
        title: "Cloud Computing",
        description: "Deploy and manage applications on the cloud.",
        icon: "fa-cloud",
      },
      {
        id: 10,
        title: "Cloud Computing",
        description: "Deploy and manage applications on the cloud.",
        icon: "fa-cloud",
      },
  ];
  
  export default categoriesData;
  

  import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles
import { FaCheckCircle, FaUserGraduate } from "react-icons/fa"; // Icons for better UI
import Navbar from "./Navbar";
import "../css/Dashboard.css";

const Certificate = () => {
 // Default to Guest
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uroll_no, setURollNo] = useState("");
  const [userName, setUserName] = useState("");


  // Fetch progress from the API
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
      

        // Retrieve username from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserName(user.userName || "Guest");
          setURollNo(user.uroll_no);
        }

        const response = await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uroll_no }), // Use the retrieved uroll_no
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setCertificates(data.requests); // Assuming the response structure contains requests
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      <div className="certificate-applied py-5">
        {/* Welcome Message */}
        <div className="text-center mb-4">
          <h1 className="text-primary fw-bold">Welcome, {userName}! 🎓</h1>
          <h3 className="text-muted">Track your certificate progress below</h3>
        </div>

        {/* Certificate Progress Section */}
        <div className="certificate-card shadow-lg p-4 border-0 rounded-4">
          <h2 className="text-center mb-4 fw-semibold">
            Your Certificates & Progress
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <ul className="list-group">
              {certificates.map((cert) => (
                <li key={cert.id} className="list-group-item border-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark">
                      <FaUserGraduate className="me-2 text-primary" />
                      {cert.name}
                    </span>
                    {cert.progress === 100 ? (
                      <FaCheckCircle className="text-success fs-5" />
                    ) : (
                      <span className="text-muted">{cert.progress}%</span>
                    )}
                  </div>
                  <div className="progress" style={{ height: "12px" }}>
                    <div
                      className={`progress-bar progress-bar-striped progress-bar-animated ${
                        cert.progress === 100 ? "bg-success" : "bg-primary"
                      }`}
                      role="progressbar"
                      style={{ width: `${cert.progress}%` }}
                      aria-valuenow={cert.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificate;
















import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap styles
import {
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaUserTie,
  FaEnvelope,
  FaUniversity,
} from "react-icons/fa"; // Icons
import "../css/Fa.css"; // Custom styles

const Facultyadvisor = () => {
  // Faculty Details
  const faculty = {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@university.edu",
    department: "Computer Science",
  };

  // State for student requests and loading/error handling
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student requests when the component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost:5000/auth/fetch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sentTo: "staff" }), // Adjust as necessary
        });

        if (!response.ok) {
          throw new Error("Failed to fetch student requests");
        }

        const data = await response.json();
        setRequests(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []); // Fetch requests on component mount

  // Handle Accept/Reject
  const handleDecision = async (documentId, status) => {
    // Update the request status locally
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.documentId === documentId ? { ...req, status } : req
      )
    );

    // Optionally, send the decision to the server
    try {
      await fetch(`http://localhost:5000/auth/files/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      // Optionally revert the local state if the update fails
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.documentId === documentId ? { ...req, status: "Pending" } : req
        )
      );
    }
  };

  return (
    <div className="container-fluid faculty-bg">
      <div className="row justify-content-center align-items-start p-4">
        {/* Left Column - Faculty Info */}
        <div className="col-md-3 mb-4">
          <div className="faculty-card card p-4">
            <FaUserTie size={50} className="text-primary faculty-icon" />
            <div className="faculty-details">
              <h4 className="faculty-name">{faculty.name}</h4>
              <p className="mb-2">
                <FaEnvelope className="me-2 text-secondary" />
                <strong>Email:</strong> {faculty.email}
              </p>
              <p>
                <FaUniversity className="me-2 text-secondary" />
                <strong>Department:</strong> {faculty.department}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Student Requests */}
        <div className="Student-card col-md-8">
          <div className="glassmorphism card p-4">
            <h3 className="Student-heading">STUDENT REQUESTS</h3>
            {loading && <p>Loading requests...</p>}
            {error && <p className="text-danger">{error}</p>}
            <ul className="list-group">
              {requests.map((req) => (
                <li
                  key={req.documentId} // Assuming documentId is unique for each request
                  className="request-item list-group-item d-flex justify-content-between align-items-center mb-3"
                >
                  <div className="d-flex flex-column">
                    <strong>{req.name}</strong>
                    <span className="text-muted">{req.categoryName}</span>
                    <a
                      href={req.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link text-primary mt-2"
                    >
                      <FaFileAlt className="me-1" /> View File
                    </a>
                  </div>
                  <div>
                    {req.status === "Pending" ? (
                      <>
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleDecision(req.documentId, "Accepted")}
                        >
                          <FaCheckCircle className="me-1" /> Accept
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDecision(req.documentId, "Rejected")}
                        >
                          <FaTimesCircle className="me-1" /> Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`badge ${
                          req.status === "Accepted"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {req.status}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facultyadvisor;
