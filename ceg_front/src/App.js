import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Categories from "./components/Categories"; // Import Categories component
import Facultyadvisor from "./components/Fa";
import StudentLoanForm from "./components/Studentform";
import "@fortawesome/fontawesome-free/css/all.min.css";

const isAuthenticated = () => !!localStorage.getItem("token");

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Private Routes */}
        <Route
          path="/Certificate"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />

        <Route
          path="/Facultyadvisor"
          element={
            <PrivateRoute>
              <Facultyadvisor />
            </PrivateRoute>
          }
        />

        <Route
          path="/StudentLoanForm/:categoryId"
          element={
            <PrivateRoute>
              <StudentLoanForm />
            </PrivateRoute>
          }
        />

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
