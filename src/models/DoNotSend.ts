import mongoose from 'mongoose';

const DoNotSendSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  reason: { type: String, default: 'Responded / Opted Out' },
  markedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.DoNotSend || mongoose.model('DoNotSend', DoNotSendSchema);
