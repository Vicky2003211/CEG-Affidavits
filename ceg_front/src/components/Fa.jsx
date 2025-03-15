import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaCheckCircle,
  FaFileAlt,
  FaUserTie,
  FaUniversity,
  FaTimesCircle,
  FaIdBadge,
} from "react-icons/fa";
import "../css/Fa.css";
import FNavbar from "./FacultyNavBar";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Facultyadvisor = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user ? user.Role : null;

  const faculty = {
    name: user?.userName || "Unknown",
    rollNo: user?.rollNo || "Not Available",
    department: user?.department || "Not Available",
    role: user?.Role || "Not Available",
    roleTitle:
      user?.Role === "staff"
        ? "Faculty Advisor"
        : user?.Role === "HOD"
        ? "Head of the Department"
        : user?.Role === "Admin"
        ? "Admin"
        : "Not Available",
  };

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!role) {
        setError("User role is not available.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/fetch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sentTo: role }),
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
  }, [role]);

  const handleAccept = async (uroll_no, categoryId) => {
    if (!role) {
      console.error("User role is not available.");
      return;
    }

    let endpoint = "";
    let nextSentTo = "";

    if (role === "staff") {
      endpoint = `${API_BASE_URL}/auth/updateFa`;
      nextSentTo = "HOD";
    } else if (role === "HOD") {
      endpoint = `${API_BASE_URL}/auth/updateHOD`;
      nextSentTo = "Admin";
    } else if (role === "Admin") {
      endpoint = `${API_BASE_URL}/auth/adminaccept`;
      nextSentTo = "Done"; // Ensure "Done" is explicitly set for admin
    } else {
      console.error("Invalid role:", role);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uroll_no, categoryId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update request");
      }

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.uroll_no === uroll_no && req.categoryId === categoryId
            ? {
                ...req,
                sentTo: nextSentTo,
                status: nextSentTo === "Done" ? "Completed" : "Accepted", // Set "Completed" when Done
              }
            : req
        )
      );
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
  
    try {
      console.log(faculty.roleTitle)
      const response = await fetch(`${API_BASE_URL}/auth/rejectRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uroll_no: selectedRequest.uroll_no,
          categoryId: selectedRequest.categoryId,
          rejectedBy: faculty.roleTitle, // Change 'rejectedBy' to 'role'
          reason: rejectionReason,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to reject request");
      }
  
      setRequests((prevRequests) =>
        prevRequests.filter(
          (req) =>
            !(
              req.uroll_no === selectedRequest.uroll_no &&
              req.categoryId === selectedRequest.categoryId
            )
        )
      );
  
      setRejectionReason("");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };
  

  return (
    <div className="container-fluid faculty-bg">
      <FNavbar />
      <div className="row justify-content-center align-items-start p-4">
        <div className="col-md-3 mb-4">
          <div className="faculty-card card p-4">
            <FaUserTie size={50} className="text-primary faculty-icon" />
            <div className="faculty-details">
              <h4 className="faculty-name">Dr. {faculty.name}</h4>
              <p><FaIdBadge className="me-2 text-secondary" /><strong>Roll No:</strong> {faculty.rollNo}</p>
              <p><FaUniversity className="me-2 text-secondary" /><strong>Department:</strong> {faculty.department}</p>
              <p><FaUserTie className="me-2 text-secondary" /><strong>Designation:</strong> {faculty.roleTitle}</p>
            </div>
          </div>
        </div>

        <div className="Student-card col-md-8">
          <div className="glassmorphism card p-4">
            <h3 className="Student-heading">STUDENT REQUESTS</h3>
            {loading && <p>Loading requests...</p>}
            {error && <p className="text-danger"></p>}
            <ul className="list-group">
              {requests.length === 0 && !loading && (
                <p style={{ fontSize: "1.5rem", fontWeight: "bold", padding: "20px", textAlign: "center" }}>
                  No requests available.
                </p>
              )}
              {requests.map((req) => (
                <li key={`${req.uroll_no}-${req.categoryId}`} className="request-item list-group-item d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex flex-column">
                    <strong>{req.name}</strong>
                    <span className="text-muted">{req.categoryName}</span>
                    <a href={req.pdfLink} target="_blank" rel="noopener noreferrer" className="btn btn-link text-primary mt-2">
                      <FaFileAlt className="me-1" /> View File
                    </a>
                  </div>
                  <div>
                    {["HOD", "Admin", "Done"].includes(req.sentTo) ? (
                      <span className="badge bg-success">Accepted</span>
                    ) : (
                      <>
                        <button className="btn btn-success me-2" onClick={() => handleAccept(req.uroll_no, req.categoryId)}>
                          <FaCheckCircle className="me-1" /> Accept
                        </button>
                        <button className="btn btn-danger" onClick={() => setSelectedRequest(req)}>
                          <FaTimesCircle className="me-1" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {selectedRequest && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content border-0 shadow-lg rounded">
        <div className="modal-header bg-danger text-white">
          <h5 className="modal-title">
            <FaTimesCircle className="me-2" /> Reject Request
          </h5>
        </div>
        <div className="modal-body text-center">
          <p className="fw-bold text-danger">
            Are you sure you want to reject this request?
          </p>
          <p className="text-muted">
            <strong>Student:</strong> {selectedRequest.name} <br />
            <strong>Category:</strong> {selectedRequest.categoryName}
          </p>
          <div className="form-floating">
            <input
              type="text"
              className="form-control border-danger"
              id="rejectionReason"
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <label htmlFor="rejectionReason">Enter rejection reason</label>
          </div>
        </div>
        <div className="modal-footer d-flex justify-content-center">
          <button className="btn btn-danger px-4" onClick={handleReject}>
            <FaTimesCircle className="me-1" /> Confirm Reject
          </button>
          <button className="btn btn-secondary px-4" onClick={() => setSelectedRequest(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Facultyadvisor;
