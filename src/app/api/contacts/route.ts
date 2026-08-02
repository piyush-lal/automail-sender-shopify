import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all contacts from the database
    const contacts = await Contact.find({}).lean();
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Failed to read contacts:', error);
    return NextResponse.json({ message: 'Failed to read contacts' }, { status: 500 });
  }
}
