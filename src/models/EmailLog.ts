import mongoose from 'mongoose';

// Fix Next.js HMR caching old schema which strips new fields
delete mongoose.models.EmailLog;

const EmailLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessEmail: { type: String, required: true },
  businessName: { type: String },
  subject: { type: String },
  message: { type: String },
  hasAttachment: { type: Boolean, default: false },
  attachmentName: { type: String },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  errorMessage: { type: String },
}, { timestamps: true });

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
