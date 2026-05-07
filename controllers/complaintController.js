const Complaint = require('../models/Complaint');
const Case = require('../models/Case');

// SUBMIT COMPLAINT
const submitComplaint = async (req, res) => {
  try {
    console.log('📁 Files:', req.files);
    console.log('📝 Body:', req.body);
    
    // Destructure caseId as well, as it's passed when adding an experience to an existing case
    const { description, category, incidentDate, location, isAnonymous, caseId } = req.body;

    let existingCase;

    // Step 1 — Find or identify the case
    if (caseId) {
      // If caseId is provided, use it directly
      existingCase = await Case.findById(caseId);
    } else if (category) {
      // Otherwise, find existing case for this category or create one
      existingCase = await Case.findOne({ 
        category: category, 
        status: 'active' 
      });

      if (!existingCase) {
        // Safety check for category before using .replace()
        const caseTitle = category ? `${category.replace(/_/g, ' ')} case` : 'New Incident Case';
        
        existingCase = await Case.create({
          title: caseTitle,
          category: category,
          description: description,
          location: location,
          createdBy: req.user.id,
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Either caseId or category is required' });
    }

    if (!existingCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    console.log('✅ Case identified:', existingCase._id);

    // Get uploaded file URLs from Cloudinary
    const evidenceFiles = req.files ? req.files.map(file => file.path) : [];

    const complaint = await Complaint.create({
      description: description,
      category: category || existingCase.category, // Use existing case category if missing
      incidentDate: incidentDate,
      location: location || existingCase.location,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true, // Handle FormData string boolean
      user: req.user.id,
      caseId: existingCase._id,
      evidenceFiles: evidenceFiles,
    });

    console.log('✅ Complaint created:', complaint._id);

    // Step 3 — Increment complaint count
    existingCase.complaintCount = (existingCase.complaintCount || 0) + 1;
    await existingCase.save();

    console.log('✅ Complaint count updated:', existingCase.complaintCount);

    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: {
        complaint: complaint,
        caseId: existingCase._id,
        complaintCount: existingCase.complaintCount,
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
    
    const complaints = await Complaint.find({ caseId: caseId }).populate('user', 'fullName name username');
    
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

module.exports = { submitComplaint, getComplaints };