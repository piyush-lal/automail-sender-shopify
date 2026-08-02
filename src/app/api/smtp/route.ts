import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id).select('smtpConfig');
    return NextResponse.json(user?.smtpConfig || {});
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { service, host, port, user: smtpUser, password, secure } = await req.json();
    await dbConnect();
    
    await User.findByIdAndUpdate((session.user as any).id, {
      smtpConfig: { service, host, port: Number(port), user: smtpUser, password, secure }
    });

    return NextResponse.json({ message: 'Config updated' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating config' }, { status: 500 });
  }
}
