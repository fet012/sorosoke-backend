const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['police_brutality', 'sexual_harassment', 'lastma_extortion',
           'landlord_dispute', 'corruption', 'workplace_abuse', 'other'],
    required: true
  },
  description: { type: String, required: true },
  location: { type: String },
  threshold: { type: Number, default: 10 },
  complaintCount: { type: Number, default: 0 },
  isAnonymous: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'threshold_reached', 'document_generated', 'resolved'],
    default: 'active'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documentGenerated: { type: Boolean, default: false },
  legalDocument: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);