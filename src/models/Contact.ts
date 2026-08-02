import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  url: { type: String, unique: true, index: true },
  name: { type: String },
  rating: { type: String },
  reviews: { type: String },
  location: { type: String },
  pricing: { type: String },
  services: { type: String },
  website: { type: String },
  phone: { type: String },
  email: { type: String },
  social_links: { type: [String], default: [] },
  primary_location: { type: String },
  supported_locations: { type: String },
  languages: { type: String }
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
