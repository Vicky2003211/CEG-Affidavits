// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./Routes/routes");
const connectDB = require("./db/config"); // Import your DB connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Define routes
app.use("/auth", authRoutes); // Use authentication routes
app.use("/api", authRoutes); // If you have other routes, use a different prefix

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
