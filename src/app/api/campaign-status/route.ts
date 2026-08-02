import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CampaignJob from '@/models/CampaignJob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    // Fetch the most recent job for this user
    const job = await CampaignJob.findOne({ userId: (session.user as any).id })
      .sort({ createdAt: -1 });

    if (!job) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({ active: true, job });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching campaign status' }, { status: 500 });
  }
}
