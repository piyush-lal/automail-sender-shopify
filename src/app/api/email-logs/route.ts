import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const logs = await EmailLog.find({ userId: (session.user as any).id }).select('businessEmail status sentAt errorMessage');
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching logs' }, { status: 500 });
  }
}
