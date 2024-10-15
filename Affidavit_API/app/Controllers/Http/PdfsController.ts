import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import fs from "fs";
import Form from "App/Models/Form";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";

export default class PdfsController {
  public async pdfGenerator({ request, response }: HttpContextContract) {
    try {
      const { form } = request.body();
      await Form.query()
        .where("form_id", form.form_id)
        .update({ status: "Certificate Generated", sentTo: null });

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      async function getBackgroundImageData() {
        const imageData = await fs.promises.readFile(
          "C:/Users/Thanush/Desktop/Bonafide Generator/Affidavit_API/app/Controllers/Http/certificate-bg.jpg",
          "base64",
        );
        return `data:image/jpeg;base64,${imageData}`;
      }

      const bankLoanHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
          }
          
          .certificate {
            width: 210mm;
            height: 297mm;
            margin: 20px auto;
            position: relative;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            page-break-inside: avoid;
          }
          .certificate img {
            width: 100%;
            height: auto;
          }
          
          .content {
            width: 80%;
            margin: 0 auto;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: left;
            padding: 20px;
            box-sizing: border-box;
            z-index: 1;
          }
          .ex-no{
            margin-bottom: 20px;
          }
          
          .ex-no span{
            margin-left: 168px;
          }
          
          .header {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
            text-transform: uppercase;
          }
          
          .date {
            margin-bottom: 20px;
          }
          
          .from,
          .to,
          .subject {
            margin-bottom: 15px;
          }
          .subject span{
            margin-left: 114px;
          }
          .content {
            margin-bottom: 20px;
          }
          
          .closing {
            margin-top: 20px;
            font-weight: bold;
          }
          
          .signature {
            margin-top: 112px;
            margin-left:369px ;
          }
          
          .download-btn {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #007BFF;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <img src="${await getBackgroundImageData()}" alt="Certificate Background">
          
          <div class="content">
            <div class="ex-no">
              Ex No:DEANCEG/EDUCATION LOAN <span>Date: XX/MM/YYYY</span>
            </div><br>
            <div class="header">Certificate </div>
            
            
            <div class="subject">
              <p><span>This</span> is to certify that Mr. ${
                form.name
              } (Roll No: ${
                form.roll_number
              }) S/o ${form.father.toUpperCase()} & ${form.mother.toUpperCase()} is a bonafide student studying in the ${
                form.semester
              }th semester (Fourth year) of ${form.course} (Full Time) in this
                 institution during the academic year ${currentYear}-${nextYear}. </p>
        <p><span>This</span> Certificate is issued to apply for Education Loan. This Certificate is used only for Education purpose only. </p>
      </div>
      
      <div class="signature">
        DEAN
        <br>(Signature & Seal of the Dean)
      </div>
      </div>
      </div>       
      </body>
      </html>`;

      const passportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
          }
          
          .certificate {
            width: 210mm;
            height: 297mm;
            margin: 20px auto;
            position: relative;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            page-break-inside: avoid;
          }
          .certificate img {
            width: 100%;
            height: auto;
          }
          
          .content {
            width: 80%;
            margin: 0 auto;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: left;
            padding: 20px;
            box-sizing: border-box;
            z-index: 1;
          }
          .ex-no{
            margin-bottom: 20px;
          }
          
          .ex-no span{
            margin-left: 168px;
          }
          
          .header {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
            text-transform: uppercase;
          }
          
          .date {
            margin-bottom: 20px;
          }
          
          .from,
          .to,
          .subject {
            margin-bottom: 15px;
          }
          .subject span{
            margin-left: 114px;
          }
          .content {
            margin-bottom: 20px;
          }
          
          .closing {
            margin-top: 20px;
            font-weight: bold;
          }
          
          .signature {
            margin-top: 112px;
            margin-left:369px ;
          }
          
          .download-btn {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #007BFF;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <img src="${await getBackgroundImageData()}" alt="Certificate Background">
          
          <div class="content">
            <div class="ex-no">
              Ex No:DEANCEG/EDUCATION LOAN <span>Date: XX/MM/YYYY</span>
            </div><br>
            <div class="header">Certificate </div>
            
            
            <div class="subject">
              <p><span>This</span> is to certify that Mr. ${
                form.name
              } (Roll No: ${
                form.roll_number
              }) S/o ${form.father.toUpperCase()} & ${form.mother.toUpperCase()} is a bonafide student studying in the ${
                form.semester
              }th semester (Fourth year) of ${form.course} (Full Time) in this
                 institution during the academic year ${currentYear}-${nextYear}. </p>
                 <p><span>This</span> Certificate is issued to enable him/her to apply for Passport.</p>
                 </div>
      <div class="signature">
        DEAN
        <br>(Signature & Seal of the Dean)
      </div>
      </div>
      </div>       
      </body>
      </html>`;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      if (form.category_id == "bona_bl") {
        await page.setContent(bankLoanHtml);
      } else if (form.category_id == "bona_pp") {
        await page.setContent(passportHtml);
      }
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });

      await browser.close();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "thanushnarayanasamy@gmail.com",
          pass: "poso ywzq bdwk tvsn",
        },
      });

      const mailOptions = {
        from: "thanushnarayanasamy@gmail.com",
        to: form.email,
        subject: "Sending PDF using Node.js",
        text: "PDF is attached.",
        attachments: [
          {
            filename: "certificate.pdf",
            content: pdfBuffer,
          },
        ],
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return response.status(500).json({ error: "Failed to send email" });
        } else {
          console.log("Email sent: " + info.response);
          return response.json({ Success: "PDF sent successfully" });
        }
      });
    } catch (error) {
      console.error("Error generating PDF and sending email:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async rejectByDean({ request, response }: HttpContextContract) {
    try {
      const { form } = request.body();

      await Form.query()
        .where("form_id", form.form_id)
        .update({ status: "Rejected", sentTo: null });

      return response.json({ Success: "Form rejected by Dean" });
    } catch (error) {
      console.error("Error rejecting form by Dean:", error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
}
