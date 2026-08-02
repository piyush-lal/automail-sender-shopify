import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read the json file from the src/data directory
    const filePath = path.join(process.cwd(), 'src', 'data', 'shopify_partners_details.json');
    const data = await fs.readFile(filePath, 'utf8');
    const contacts = JSON.parse(data);
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Failed to read contacts:', error);
    return NextResponse.json({ message: 'Failed to read contacts' }, { status: 500 });
  }
}
