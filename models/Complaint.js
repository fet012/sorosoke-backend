const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['police_brutality', 'sexual_harassment', 'lastma_extortion',
           'landlord_dispute', 'corruption', 'workplace_abuse', 'other'],
    required: true
  },
  incidentDate: { type: Date },
  location: { type: String },
  isAnonymous: { type: Boolean, default: false },
  evidenceFiles: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);