const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");
const RequestForm = require("../models/RequestForm");
const PDFStorage = require("../models/PDFdocument");
const Grid = require("gridfs-stream");
const fs = require("fs");
const path = require("path");

const conn = mongoose.connection;
let gfs, gridfsBucket;

// ✅ Initialize GridFS when MongoDB connection is open
conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "pdfs" });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("pdfs");
  console.log("✅ GridFS Initialized");
});

// ✅ Generate Bonafide Certificate PDF (Using PDFKit)
const Generate_PDF = async (req, res) => {
  try {
    const { uroll_no, categoryId } = req.body;
    if (!uroll_no || !categoryId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // 🔍 Fetch form data
    const form = await RequestForm.findOne({ uroll_no, categoryId });
    if (!form) {
      return res.status(404).json({ error: "No form data found" });
    }

    await RequestForm.updateOne({ uroll_no }, { status: "Completed", sentTo: "Done" });

    const filename = `bonafide_${form.uroll_no}_${uuidv4()}.pdf`;
    const documentId = new mongoose.Types.ObjectId();

    // ✅ Create PDF
    const doc = new PDFDocument({ size: "A4" });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const uploadStream = gridfsBucket.openUploadStreamWithId(documentId, filename, { contentType: "application/pdf" });

      uploadStream.end(pdfBuffer);
      uploadStream.on("finish", async () => {
        try {
          const newPDF = new PDFStorage({ uroll_no, categoryId, documentId });
          await newPDF.save();
          return res.status(200).json({ success: true, message: "PDF stored successfully", documentId });
        } catch (error) {
          console.error("Error saving PDFStorage entry:", error);
          return res.status(500).json({ error: "Failed to store PDF" });
        }
      });
    });


    
    // Path to the background image (Ensure this file exists)
    const backgroundPath = path.join(__dirname, "certificate-bg.png");



    
    // ✅ Add Background Image (Make sure the image exists in your project)
    doc.image(backgroundPath, 0, 0, { width: doc.page.width, height: doc.page.height });


    doc.moveDown(12);
    
    doc.fontSize(24).font("Times-Bold").text("ANNA UNIVERSITY, CEG", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(18).text("Bonafide Certificate", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(14).text("TO WHOMSOEVER IT MAY CONCERN", { align: "center" });
    doc.moveDown(1);
    
    doc.fontSize(12).text(
      `This is to certify that Mr. ${form.name.toUpperCase()} (Roll No: ${form.uroll_no}),` +
      ` son of ${form.father_name.toUpperCase()} and ${form.mother_name.toUpperCase()},` +
      ` is a bonafide student of this institution. He is currently enrolled in` +
      ` the ${form.semester}th semester of the ${form.course} (Full-Time) program.`
    );
    
    doc.moveDown(1);
    doc.fontSize(12).text(`This Certificate is issued for ${form.categoryName} Purpose only.`);
    doc.moveDown(6);
    

    doc.moveDown(4);
    doc.fontSize(14).text("DEAN", { align: "right" });
    doc.fontSize(12).text("(Signature & Seal of the Dean)", { align: "right" });
    
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Retrieve and Serve PDF
const Get_PDF = async (req, res) => {
  try {
    const { uroll_no, categoryId } = req.body;
    if (!uroll_no || !categoryId) {
      return res.status(400).json({ error: "uroll_no and categoryId are required" });
    }

    const pdfEntry = await PDFStorage.findOne({ uroll_no, categoryId });
    if (!pdfEntry || !pdfEntry.documentId) {
      return res.status(404).json({ error: "No PDF found" });
    }

    const readStream = gridfsBucket.openDownloadStream(new mongoose.Types.ObjectId(pdfEntry.documentId));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    readStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving PDF:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { Generate_PDF, Get_PDF };
