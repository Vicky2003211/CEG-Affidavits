const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer-core");
const { v4: uuidv4 } = require("uuid");
const RequestForm = require("../models/RequestForm");
const PDFDocument = require("../models/PDFdocument"); // Import the model
const Grid = require("gridfs-stream");

const conn = mongoose.connection;
let gfs, gridfsBucket;

// Initialize GridFS when MongoDB is connected
conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "pdfs" });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("pdfs");
});

// ✅ Function to Generate Bonafide Certificate PDF
const Generate_PDF = async (req, res) => {
  try {
    const { uroll_no, categoryId } = req.body;
    if (!uroll_no || !categoryId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const form = await RequestForm.findOne({ uroll_no, categoryId });
    if (!form) {
      return res.status(404).json({ error: "No form data found" });
    }

    await RequestForm.updateOne({ uroll_no }, { status: "Completed", sentTo: "Done" });

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const filename = `bonafide_${form.uroll_no}_${uuidv4()}.pdf`;
    const documentId = new mongoose.Types.ObjectId();

    const backgroundPath = path.join(__dirname, "certificate-bg.jpg");
    const backgroundBase64 = fs.existsSync(backgroundPath)
      ? `data:image/jpeg;base64,${fs.readFileSync(backgroundPath).toString("base64")}`
      : "";

    const certificateHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: 'Times New Roman', serif; text-align: center; margin: 0; padding: 0; width: 210mm; height: 297mm; position: relative; overflow: hidden; }
          .background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
          .container { position: relative; width: 100%; height: 100%; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; }
          .title { font-size: 28px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
          .subtitle { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
          .content { font-size: 16px; text-align: justify; width: 80%; margin: 0 auto; }
          .signature-container { position: absolute; bottom: 200px; right: 60px; }
          .signature { font-weight: bold; font-size: 18px; }
          .seal { font-size: 14px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <img class="background" src="${backgroundBase64}" />
        <div class="container">
          <div class="title">ANNA UNIVERSITY, CEG</div>
          <br><br>
          <div class="subtitle">Bonafide Certificate</div>
          <br><br>
          <p class="content"><strong>TO WHOMSOEVER IT MAY CONCERN</strong></p>
          <br><br>
          <p class="content">
  This is to certify that <strong>Mr.${form.name.toUpperCase()}</strong> (Roll No: <strong>${form.uroll_no}</strong>),  
  son of <strong>${form.father_name.toUpperCase()}</strong> and <strong>${form.mother_name.toUpperCase()}</strong>,  
  is a bonafide student of this institution. He is currently enrolled in the <strong>${form.semester}th</strong>  
  semester of the <strong>${form.course}</strong> (Full-Time) program for the academic year  
  <strong>${currentYear}-${nextYear}</strong>.
</p>

          <br><br>
          <p class="content">This Certificate is issued for <strong>${form.categoryName}</strong> Purpose only.</p>
          <div class="signature-container">
            <div class="signature">DEAN</div>
            <div class="seal">(Signature & Seal of the Dean)</div>
          </div>
        </div>
      </body>
      </html>`;

    const browser = await puppeteer.launch({
      executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      headless: "new",
    });

    const page = await browser.newPage();
    await page.setContent(certificateHtml, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      width: "210mm",
      height: "250mm",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    const uploadStream = gridfsBucket.openUploadStreamWithId(documentId, filename, { contentType: "application/pdf" });
    // ✅ Attach 'finish' listener BEFORE calling 'end'
    uploadStream.on("finish", async () => {
      try {
        const newPDF = new PDFDocument({
          uroll_no,
          categoryId,
          documentId: documentId, // ✅ Correct documentId stored
        });

        await newPDF.save(); // Save to PDFDocument collection

        if (!res.headersSent) {
          return res.status(200).json({
            success: true,
            message: "PDF generated and stored successfully",
            documentId: documentId, // ✅ Return correct documentId
          });
        }
      } catch (error) {
        console.error("Error saving PDFDocument:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to store PDF document" });
        }
      }
    });

    // ✅ Now call 'end' after attaching the listener
    await uploadStream.end(pdfBuffer);

  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};


const Get_PDF = async (req, res) => {
  try {
    const { uroll_no, categoryId } = req.body;


    if (!uroll_no || !categoryId) {
      return res.status(400).json({ error: "uroll_no and categoryId are required" });
    }

    const pdfEntry = await PDFDocument.findOne({ uroll_no, categoryId });

    if (!pdfEntry || !pdfEntry.documentId) {
      return res.status(404).json({ error: "No PDF found for the given details" });
    }

    const documentId = pdfEntry.documentId;

    const readStream = gridfsBucket.openDownloadStream(new mongoose.Types.ObjectId(documentId));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error("Error retrieving PDF:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming PDF" });
      }
    });
  } catch (error) {
    console.error("Error retrieving PDF:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

module.exports = { Generate_PDF, Get_PDF };
