const mongoose = require("mongoose");
const Category = require("../ceg_affidavits/models/Category"); // Adjust path based on your project structure
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to add categories with icons
const addCategories = async () => {
  try {
    const categories = [
      { categoryName: "Education", description: "This Bonafide Certificate is required for academic verification to confirm a student’s enrollment in an institution. It serves as proof of study and is often requested by various organizations.", icon: "fa-solid fa-graduation-cap" },
      { categoryName: "Scholarship", description: "A Bonafide Certificate issued to students applying for scholarships and financial aid programs. This document serves as verification of academic status and is mandatory for many government and private funding agencies.", icon: "fa-solid fa-hand-holding-dollar" },
      { categoryName: "Bank", description: "A Bonafide Certificate required by banks when students apply for education loans, student accounts, or financial assistance. It confirms a student’s enrollment and academic details.", icon: "fa-solid fa-building-columns" },
      { categoryName: "Visa", description: "This Bonafide Certificate is needed for visa applications when a student is planning to study or travel abroad. It serves as proof of admission to a recognized institution.", icon: "fa-solid fa-passport" },
      {
        categoryName: "Internship",
        description: "Required by companies for student internships. This verifies the student's current enrollment, eligibility, and duration of study.",
        icon: "fa-solid fa-briefcase"
      },
      {
        categoryName: "Passport Application",
        description: "Mandatory for students applying for a passport. It serves as proof of identity and academic affiliation when submitting a passport application.",
        icon: "fa-solid fa-passport"
      },
      {
        categoryName: "Government Services",
        description: "Issued to students who need proof of enrollment for government-related benefits such as travel concessions, educational subsidies, or public service exams.",
        icon: "fa-solid fa-landmark"
      },
      {
        categoryName: "Hostel Admission",
        description: "Required for students seeking hostel accommodation, either within or outside the campus, confirming their admission and course details.",
        icon: "fa-solid fa-bed"
      },
      {
        categoryName: "Industrial Visit",
        description: "Needed for students to obtain permission for industrial visits as part of their coursework, verifying the institution’s authorization for the visit.",
        icon: "fa-solid fa-industry"
      },
      {
        categoryName: "Competitive Exams",
        description: "Mandatory for students applying for competitive exams like GATE, UPSC, or other government exams requiring proof of academic enrollment.",
        icon: "fa-solid fa-book"
      },
      {
        categoryName: "Higher Studies",
        description: "Issued to students applying for higher education abroad or in other universities. This certificate confirms academic credentials and institutional affiliation.",
        icon: "fa-solid fa-university"
      },
      {
        categoryName: "Employee Verification",
        description: "For students seeking part-time jobs or employment verification, confirming their enrollment and academic standing for employer verification.",
        icon: "fa-solid fa-user-check"
      }
    ];

    for (const category of categories) {
      const newCategory = new Category(category);
      await newCategory.save();
    }

    console.log("✅ Categories added successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error adding categories:", error);
    mongoose.connection.close();
  }
};

// Run the function
addCategories();
