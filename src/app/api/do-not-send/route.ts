import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DoNotSend from '@/models/DoNotSend';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const list = await DoNotSend.find({}).sort({ markedAt: -1 });
    return NextResponse.json(list);
  } catch (error) {
    console.error('Failed to fetch do-not-send list:', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { email, reason } = await req.json();
    if (!email) return NextResponse.json({ message: 'Missing email' }, { status: 400 });

    await dbConnect();
    
    // Check if already exists
    const existing = await DoNotSend.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'Already marked as Do Not Send' }, { status: 200 });
    }

    const newEntry = await DoNotSend.create({ email, reason });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Failed to add to do-not-send:', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ message: 'Missing email' }, { status: 400 });

    await dbConnect();
    await DoNotSend.deleteOne({ email });
    return NextResponse.json({ message: 'Removed from Do Not Send' }, { status: 200 });
  } catch (error) {
    console.error('Failed to remove from do-not-send:', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}
