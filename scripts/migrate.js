import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

const MONGODB_URI = "mongodb://127.0.0.1:27017/email_sender";

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

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to local MongoDB');

    const filePath = path.join(process.cwd(), 'src', 'data', 'shopify_partners_details.json');
    const data = await fs.readFile(filePath, 'utf8');
    const contacts = JSON.parse(data);
    console.log(`Read ${contacts.length} contacts from JSON file`);

    const operations = contacts.map((contact) => ({
      updateOne: {
        filter: { url: contact.url },
        update: { $set: contact },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Contact.bulkWrite(operations, { ordered: false });
      console.log('Data migration complete!');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
