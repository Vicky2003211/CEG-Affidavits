const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RequestForm = require("../models/RequestForm");

// 🔹 User Login
const login = async (req, res) => {
  const { uroll_no, password } = req.body;

  try {
    // Find user by roll number
    const user = await User.findOne({ uroll_no });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const secretKey = process.env.SECRET_TOKEN || "default_secret";
    const token = jwt.sign(
      {
        userName: user.name,
        rollNo: user.uroll_no,
        department: user.department,
        course: user.course,
        Role: user.role,
      },
      secretKey,
      { expiresIn: "2m" }
    );

    return res.json({
      success: true,
      token,
      payload: {
        userName: user.name,
        rollNo: user.uroll_no,
        department: user.department,
        course: user.course,
        Role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 User Registration
const register = async (req, res) => {
  try {
    const { name, uroll_no, department, password, role, semester, course } = req.body;

    // Validate role
    if (!["student", "staff", "HOD", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Choose 'student' or 'staff'." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ uroll_no });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this roll number." });
    }

    // Create user object
    const userData = { name, uroll_no, department, password, role };
    if (role === "student") {
      userData.semester = semester;
      userData.course = course;
    }

    const newUser = new User(userData);
    await newUser.save();

    // Generate JWT token
    const secretKey = process.env.SECRET_TOKEN || "default_secret";
    const tokenPayload = {
      userName: newUser.name,
      rollNo: newUser.uroll_no,
      department: newUser.department,
      role: newUser.role,
    };

    if (role === "student") {
      tokenPayload.course = newUser.course;
    }

    const token = jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      token,
      payload: tokenPayload,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔹 Get User Request Progress
const progress = async (req, res) => {
  const { uroll_no } = req.body;
  try {
    if (!uroll_no) {
      return res.status(400).json({ message: "uroll_no is required" });
    }

    // Find all requests for the user
    const requests = await RequestForm.find({ uroll_no });

    if (!requests.length) {
      return res.status(404).json({ message: "No requests found for this user." });
    }

    // Prepare the response with sentTo and categoryName for each request
    const response = requests.map(request => ({
      sentTo: request.sentTo,
      categoryName: request.categoryName,
      categoryId: request.categoryId,
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, register, progress };
