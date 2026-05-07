const Case = require('../models/Case');
const Complaint = require('../models/Complaint');

// CREATE CASE
const createCase = async (req, res) => {
  try {
    const { title, category, description, location } = req.body;

    const newCase = await Case.create({
      title,
      category,
      description,
      location,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET ALL CASES WITH SEARCH AND FILTER
const getAllCases = async (req, res) => {
  try {
    const { keyword, category, location } = req.query;

    let query = { status: 'active' };

    if (category) {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    const cases = await Case.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE CASE
const getCaseById = async (req, res) => {
  try {
    // Populate createdBy to show the reporter's name
    const singleCase = await Case.findById(req.params.id).populate('createdBy', 'fullName name username');

    if (!singleCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Add author mapping for frontend compatibility
    const responseData = singleCase.toObject();
    responseData.author = responseData.createdBy;

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET USER'S OWN CASES (Cases they created OR cases they have complaints in)
const getMyCases = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all complaints by the user and get their caseIds
    const userComplaints = await Complaint.find({ user: userId }).select('caseId');
    const caseIdsFromComplaints = userComplaints
      .filter(c => c.caseId)
      .map(c => c.caseId.toString());
    
    // Find cases where the user is the creator
    const casesCreatedByUser = await Case.find({ createdBy: userId }).select('_id');
    const caseIdsFromCreated = casesCreatedByUser.map(c => c._id.toString());
    
    // Combine and deduplicate
    const uniqueCaseIds = [...new Set([...caseIdsFromCreated, ...caseIdsFromComplaints])];
    
    const cases = await Case.find({ 
      _id: { $in: uniqueCaseIds } 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    console.error("Error in getMyCases:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCase, getAllCases, getCaseById, getMyCases };