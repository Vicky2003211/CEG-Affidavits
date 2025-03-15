const RequestForm = require("../models/RequestForm");
const Rejection = require("../models/RejectionModel");

const Reject = async (req, res) => {
    const { uroll_no, categoryId, rejectedBy, reason } = req.body;


    try {
        // Step 1: Check if the request exists
        const requestExists = await RequestForm.findOne({ uroll_no, categoryId });
        if (!requestExists) {
            return res.status(404).json({ message: "Request not found", uroll_no, categoryId });
        }

        // Step 2: Update the main requests table
        const updateResult = await RequestForm.updateOne(
            { uroll_no, categoryId, sentTo: { $ne: "Rejected" } }, // Check that sentTo is not "Rejected"
            {
                $set: { sentTo: "Rejected" }, // Only update status in the main table
            }
        );
        

        // Check if the update was successful
        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ message: "Request not found", uroll_no, categoryId });
        }

        // Step 3: Create a new rejection entry using RejectionModel
        const rejectionEntry = new Rejection({
            uroll_no,
            categoryId,
            rejectedBy: rejectedBy,
            rejectionReason: reason,
            rejectedAt: new Date(),
        });

        // Step 4: Save the rejection entry to the database
        await rejectionEntry.save();

        // Optionally return the rejection entry details
        res.json({ message: "Request rejected", rejectionEntry });
    } catch (error) {
        console.error("Error rejecting request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getRejections = async (req, res) => {
    const { uroll_no, categoryId } = req.body;
    

    try {
        const rejections = await Rejection.find({ uroll_no, categoryId });

        if (rejections.length === 0) {
            return res.status(404).json({ message: "No rejection records found" });
        }

        res.json(rejections);
    } catch (error) {
        console.error("Error fetching rejection details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Delete request function
const deleteRequest = async (req, res) => {
  const { uroll_no, categoryId } = req.body;

  try {
    // Find and delete the request record
    const result = await RequestForm.findOneAndDelete({ uroll_no, categoryId });
    
    if (!result) {
      return res.status(404).json({ message: "Request not found." });
    }

    res.status(200).json({ message: "Request successfully deleted." });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



module.exports = { Reject, getRejections, deleteRequest };


