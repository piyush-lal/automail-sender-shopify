import mongoose from 'mongoose';

const CampaignJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalContacts: { type: Number, required: true },
  processedCount: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
}, { timestamps: true });

export default mongoose.models.CampaignJob || mongoose.model('CampaignJob', CampaignJobSchema);
