const Complaint = require('../models/Complaint');
const Case = require('../models/Case');



// SUBMIT COMPLAINT
const submitComplaint = async (req, res) => {
  try {

    console.log('📁 Files:', req.files);
    console.log('📝 Body:', req.body);
    const { description, category, incidentDate, location, isAnonymous } = req.body;

    // Step 1 — Find existing case for this category or create one
    let existingCase = await Case.findOne({ 
      category: category, 
      status: 'active' 
    });

    if (!existingCase) {
      existingCase = await Case.create({
        title: `${category.replace(/_/g, ' ')} case`,
        category: category,
        description: description,
        location: location,
        createdBy: req.user.id,
      });
    }

    console.log('✅ Case found/created:', existingCase._id);
// Get uploaded file URLs from Cloudinary
const evidenceFiles = req.files ? req.files.map(file => file.path) : [];

const complaint = await Complaint.create({
  description: description,
  category: category,
  incidentDate: incidentDate,
  location: location,
  isAnonymous: isAnonymous || false,
  user: req.user.id,
  caseId: existingCase._id,
  evidenceFiles: evidenceFiles,
});
    console.log('✅ Complaint created:', complaint._id);
    console.log('✅ Linked to case:', complaint.caseId);

    // Step 3 — Increment complaint count
    existingCase.complaintCount += 1;
    await existingCase.save();

    console.log('✅ Complaint count updated:', existingCase.complaintCount);

    // Step 4 — Check threshold
    await checkAndTriggerThreshold(existingCase);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint: complaint,
        caseId: existingCase._id,
        complaintCount: existingCase.complaintCount,
        threshold: existingCase.threshold,
      }
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET COMPLAINTS FOR A CASE
const getComplaints = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    console.log('🔍 Looking for complaints with caseId:', caseId);
    
    const complaints = await Complaint.find({ caseId: caseId });
    
    console.log('✅ Complaints found:', complaints.length);

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// THRESHOLD DETECTION
const checkAndTriggerThreshold = async (caseDoc) => {
  const thresholds = {
    sexual_harassment: 5,
    police_brutality: 5,
    lastma_extortion: 30,
    landlord_dispute: 10,
    corruption: 50,
    workplace_abuse: 10,
    other: 10,
  };

  const threshold = thresholds[caseDoc.category] || 10;

  if (caseDoc.complaintCount >= threshold && !caseDoc.documentGenerated) {
    console.log(`⚡ Threshold reached for case ${caseDoc._id}`);
    await Case.findByIdAndUpdate(caseDoc._id, {
      status: 'threshold_reached',
    });
  }
};

module.exports = { submitComplaint, getComplaints };