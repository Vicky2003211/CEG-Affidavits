const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // Import UUID package to generate unique IDs
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFSBucket } = require("mongodb");
const connectDB = require("../db/config");
const RequestForm = require("../models/RequestForm");
const { Generate_PDF } = require("../Controllers/Pdfcontroller");

const router = express.Router();

// Connect to MongoDB
connectDB();

// Set up GridFS
const conn = mongoose.connection;
let gfs, gridFSBucket;

conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "pdfs" });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("pdfs");
});

// Multer Storage (For In-Memory File Handling)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// **1️⃣ Upload PDF with Metadata**
const studentRequest = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded!" });

    const formData = req.body;

    // Check if the request already exists
    let existingRequest = await RequestForm.findOne({
      uroll_no: formData.uroll_no,
      categoryId: formData.categoryId,
    });

    if (existingRequest) {
      // Instead of rejecting, update existing request with correct metadata
      existingRequest.sentTo = "staff";
      existingRequest.status = "pending";
      existingRequest.uploadedAt = new Date();
      await existingRequest.save();
      return res.json({ success: "✅ Request updated successfully!", form_id: existingRequest.form_id });
      
    } else {
      // Convert Buffer to Readable Stream
      const stream = gridFSBucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: {
          name: formData.name,
          uroll_no: formData.uroll_no,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          course: formData.course,
          department: formData.department,
          semester: formData.semester,
          email: formData.email,
          categoryId: formData.categoryId,
          categoryName: formData.categoryName,
          sentTo: "staff",
          status: "pending",
          uploadedAt: new Date(),
        },
      });

      stream.end(req.file.buffer);

      stream.on("finish", async () => {
        const fileId = stream.id;
        const form_id = uuidv4();

        const newForm = new RequestForm({
          name: formData.name,
          uroll_no: formData.uroll_no,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          course: formData.course,
          department: formData.department,
          semester: formData.semester,
          email: formData.email,
          categoryId: formData.categoryId,
          categoryName: formData.categoryName,
          documentId: fileId,
          form_id: form_id,
          sentTo: "staff",
          status: "pending",
          uploadedAt: new Date(),
        });

        await newForm.save();
        res.json({ success: "✅ PDF Uploaded Successfully!", form_id });
      });
    }
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// **2️⃣ Get All Uploaded PDFs with Metadata**
const StaffRequest = async (req, res) => {
  try {
    // Fetch all request forms
    const forms = await RequestForm.find(); // Make sure to import the RequestForm model

    // Create an array to hold the file data along with form details
    const formsWithFiles = [];

    for (const form of forms) {
      // Fetch the file from GridFS using the documentId
      const file = await gfs.files.findOne({ _id: form.documentId });

      if (file) {
        // Push combined form data and file metadata into the array
        formsWithFiles.push({
          ...form.toObject(), // Convert Mongoose document to plain JavaScript object
          file: {
            filename: file.filename,
            contentType: file.contentType,
            uploadDate: file.uploadDate,
            // Add other file metadata if needed
          },
        });
      } else {
        // Handle cases where the file might not be found
        formsWithFiles.push({
          ...form.toObject(),
          file: null, // No file found for this form
        });
      }
    }

    // Send the combined data as response
    res.json(formsWithFiles);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

const Pdf = async (req, res) => {
  try {
    const fileId = req.params.id; // Get the file ID from the request parameters

    // Find the file in GridFS
    const file = await gfs.files.findOne({
      _id: new mongoose.Types.ObjectId(fileId),
    });

    if (!file) {
      console.error("File not found for ID:", fileId);
      return res.status(404).json({ error: "File not found" });
    }

    // Create a read stream for the file and pipe it to the response
    const downloadStream = gridFSBucket.openDownloadStream(file._id);

    res.set("Content-Type", file.contentType); // Set content type for the response
    downloadStream.pipe(res); // Stream the file to the response

    downloadStream.on("error", (error) => {
      console.error("Error during download stream:", error);
      res.status(500).json({ error: "Error retrieving file" });
    });
  } catch (err) {
    console.error("Server error while retrieving PDF:", err);
    res.status(500).send("Server Error");
  }
};

const FARequest = async (req, res) => {
  try {
    // Extract sentTo from the request body
    const { sentTo } = req.body; // Ensure you are sending sentTo in the request body

    // Find the student request in the database based on sentTo
    const studentRequests = await RequestForm.find({ sentTo }); // Adjust the model name accordingly

    // Check if any student requests were found
    if (!studentRequests || studentRequests.length === 0) {
      return res.status(404).json({
        message: "No student requests found for the specified sentTo.",
      });
    }

    // Map the results to extract required information
    const responseData = studentRequests.map((request) => {
      const { name, categoryName, documentId, uroll_no, categoryId } = request;

      // Construct the PDF link (modify the base URL according to your setup)
      const BASE_URL = "https://ceg-affidavits-backend.onrender.com"; 
      const pdfLink = `${BASE_URL}/auth/files/${documentId}`;

      return {
        name,
        categoryName,
        uroll_no,
        categoryId,
        pdfLink,
      };
    });

    // Respond with the extracted information
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const FaAccept = async (req, res) => {
  const { uroll_no, categoryId } = req.body;
  const sentTo = "staff"; // Initial status that needs to be updated

  try {
    if (!uroll_no || !categoryId) {
      return res
        .status(400)
        .json({ message: "uroll_no and categoryId are required." });
    }

    const result = await RequestForm.updateOne(
      { uroll_no, categoryId, sentTo }, // Ensure correct record is found
      { $set: { sentTo: "HOD" } } // Correct MongoDB update syntax
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "No record found to update." });
    }

    res.status(200).json({ message: "Record updated successfully." });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const HODAccept = async (req, res) => {
  const { uroll_no, categoryId } = req.body;
  const sentTo = "HOD"; // Current status before updating

  try {
    if (!uroll_no || !categoryId) {
      return res
        .status(400)
        .json({ message: "uroll_no and categoryId are required." });
    }

    const result = await RequestForm.updateOne(
      { uroll_no, categoryId, sentTo }, // Filter to find the record
      { $set: { sentTo: "Admin" } } // Correct MongoDB update syntax
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "No record found to update." });
    }

    res.status(200).json({ message: "Record updated successfully." });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const AdminAccept = async (req, res) => {
  const { uroll_no, categoryId } = req.body;
  const sentTo = "Admin"; 

  try {
    if (!uroll_no || !categoryId) {
      return res
        .status(400)
        .json({ message: "uroll_no and categoryId are required." });
    }


    // Find the record, allowing cases where `sentTo` might be null
    const existingRequest = await RequestForm.findOne({ uroll_no, categoryId });

    if (!existingRequest) {
      return res.status(404).json({ message: "No record found to update." });
    }

    // Ensure `sentTo` is correctly set to "Admin" before updating to "Done"
    if (existingRequest.sentTo !== "Admin") {
      return res.status(400).json({ message: "Request is not at the Admin stage." });
    }

    // Update `sentTo` to "Done"
    existingRequest.sentTo = "Done";
    await existingRequest.save();


    // Generate the final PDF
    return await Generate_PDF(req, res);
  } catch (error) {
    console.error("Error updating record:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


// Export the function to be used in the routes
module.exports = {
  studentRequest,
  upload,
  StaffRequest,
  Pdf,
  FARequest,
  FaAccept,
  HODAccept,
  AdminAccept,
};
