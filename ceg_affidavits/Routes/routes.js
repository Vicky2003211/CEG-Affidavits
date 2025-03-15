// Routes/routes.js
const express = require("express");
const { login, register, progress } = require("../Controllers/AuthController");
const { category } = require("../Controllers/CategoryController");
const authMiddleware = require("../Middleware/Authmiddleware");
const { studentRequest, upload, StaffRequest, Pdf, FARequest, FaAccept, HODAccept, AdminAccept } = require("../controllers/Formcontroller");
const {Generate_PDF, Get_PDF} = require("../Controllers/Pdfcontroller")
const {Reject, getRejections, deleteRequest} = require("../Controllers/Rejection")
const router = express.Router();

// Authentication Routes
router.post("/login", login);
router.post("/register", register);
router.get("/categories", category);
router.post("/progress", progress);
router.post("/fetch",FARequest)
router.patch("/updateFa",FaAccept)
router.patch("/updateHod",HODAccept)

router.post("/getpdf", Get_PDF); 
router.patch("/adminaccept", AdminAccept);
router.post("/generatepdf",Generate_PDF)

router.post("/rejectRequest",Reject)
router.post("/getRejections", getRejections);
router.delete('/deleteRequest', deleteRequest);


// PDF Handling Routes
router.post("/upload", upload.single("document"), studentRequest); // Handle PDF upload
router.get("/StaffRequest", StaffRequest);
router.get('/files/:id', Pdf);

// 🔒 Protected Route (Only logged-in users can access)
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your profile!", user: req.user });
});

module.exports = router;
