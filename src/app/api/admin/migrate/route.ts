import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    await dbConnect();
    
    const filePath = path.join(process.cwd(), 'src', 'data', 'shopify_partners_details.json');
    const data = await fs.readFile(filePath, 'utf8');
    const contacts = JSON.parse(data);

    // Bulk insert, using unordered to skip duplicates easily
    const operations = contacts.map((contact: any) => ({
      updateOne: {
        filter: { url: contact.url },
        update: { $set: contact },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Contact.bulkWrite(operations, { ordered: false });
    }

    return NextResponse.json({ message: `Successfully processed ${operations.length} contacts.` });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ message: 'Migration failed', error: error.message }, { status: 500 });
  }
}
