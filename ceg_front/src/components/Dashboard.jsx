import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { v4 as uuidv4 } from 'uuid';
import { FaCheckCircle, FaUserGraduate, FaExclamationTriangle, FaDownload, FaEye, FaTrash } from "react-icons/fa"; // Import the trash icon
import Navbar from "./Navbar";
import "../css/Dashboard.css";

const Certificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [uroll_no, setUrollNo] = useState("");
  const [rejections, setRejections] = useState({}); // Store rejection details

  const fetchCertificates = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("User not found in local storage.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setUserName(user.userName || "Guest");
      setUrollNo(user.rollNo);

      const response = await fetch("http://localhost:5000/auth/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uroll_no: user.rollNo }),
      });

      if (!response.ok) throw new Error("");

      const data = await response.json();
      const requests = Array.isArray(data) ? data : data.requests;

      if (requests && Array.isArray(requests) && requests.length > 0) {
        const mappedCertificates = requests.map((cert) => {
          console.log("Certificate Data:", cert); // Debugging log
          let progress = 0;
          switch (cert.sentTo) {
            case "staff": progress = 25; break;
            case "HOD": progress = 50; break;
            case "Admin": progress = 75; break;
            case "Done": progress = 100; break;
            case "Rejected": progress = 0; break; // Handle rejected case
            default: progress = 0;
          }
          return { id: uuidv4(), name: cert.categoryName, categoryId: cert.categoryId, progress, sentTo: cert.sentTo };
        });
        setCertificates(mappedCertificates);
        fetchRejections(user.rollNo, requests.map(cert => cert.categoryId)); // Fetch rejections after fetching certificates
      } else {
        setError("No certificates found.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRejections = async (uroll_no, categoryId) => {
    try {
      const response = await fetch("http://localhost:5000/auth/getRejections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uroll_no, categoryId }),
      });

      if (!response.ok) throw new Error("Failed to fetch rejections");

      const rejectionData = await response.json();
      const rejectionMap = {};
      rejectionData.forEach(rejection => {
        rejectionMap[rejection.categoryId] = {
          rejectedBy: rejection.rejectedBy,
          rejectionReason: rejection.rejectionReason,
        };
      });
      setRejections(rejectionMap); // Store the rejection details mapped by categoryId
    } catch (error) {
      console.error("Error fetching rejections:", error);
    }
  };

  const handlePreview = async (categoryId) => {
    const response = await fetch("http://localhost:5000/auth/getpdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uroll_no, categoryId })
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else {
      alert("Failed to preview PDF");
    }
  };

  const handleDownload = async (categoryId) => {
    const response = await fetch("http://localhost:5000/auth/getpdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uroll_no, categoryId })
    });
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate_${categoryId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("Failed to download PDF");
    }
  };

  const handleDeleteRequest = async (categoryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this request?");
    if (!confirmDelete) return;

    try {
      const response = await fetch("http://localhost:5000/auth/deleteRequest", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uroll_no, categoryId }), // Send uroll_no and categoryId
      });

      if (!response.ok) throw new Error("Failed to delete request");

      // Refresh the certificates
      fetchCertificates(); // Call the function to refresh certificates
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchCertificates(); // Fetch certificates on component mount
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      <div className="certificate-applied py-5">
        <div className="text-center mb-4">
          <h1 className="text-primary fw-bold">Welcome, {userName}! 🎓</h1>
          <h3 className="text-muted">Track your certificate progress below</h3>
        </div>

        {loading && <p>Loading certificates...</p>}
        {error && <p className="text-danger">{error}</p>}

        {certificates.length === 0 && !loading && (
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <FaExclamationTriangle className="fs-3 me-2" />
            <div>
              <h4 className="alert-heading">No Certificates Found</h4>
              <p>Please check back later or contact support if you believe this is an error.</p>
            </div>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="certificate-card shadow-lg p-4 border-0 rounded-4">
            <h2 className="text-center mb-4 fw-semibold">Your Certificates & Progress</h2>
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
                  {cert.sentTo === "Rejected" && (
                    <div className="text-danger d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Rejected By:</strong> {rejections[cert.categoryId]?.rejectedBy || 'Unknown'}<br />
                        <strong>Reason:</strong> {rejections[cert.categoryId]?.rejectionReason || 'No reason provided'}
                      </div>
                      <FaTrash 
                        className="text-danger dash-cursor-pointer" 
                        onClick={() => handleDeleteRequest(cert.categoryId)} // Trigger deletion on click
                      />
                    </div>
                  )}
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
                  {cert.progress === 100 && (
                    <div className="mt-3 d-flex gap-3">
                      <button className="btn btn-primary" onClick={() => handlePreview(cert.categoryId)}>
                        <FaEye className="me-2" /> Preview
                      </button>
                      <button className="btn btn-success" onClick={() => handleDownload(cert.categoryId)}>
                        <FaDownload className="me-2" /> Download
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificate;
