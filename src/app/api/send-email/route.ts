import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmailLog from '@/models/EmailLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { contact } = await req.json();
    if (!contact || !contact.email) {
      return NextResponse.json({ message: 'Invalid contact' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user || !user.smtpConfig || !user.smtpConfig.user) {
      return NextResponse.json({ message: 'SMTP not configured' }, { status: 400 });
    }

    // Configure Nodemailer
    const transporterOptions: any = {
      host: user.smtpConfig.host,
      port: user.smtpConfig.port,
      secure: user.smtpConfig.secure,
      auth: {
        user: user.smtpConfig.user,
        pass: user.smtpConfig.password,
      },
    };
    if (user.smtpConfig.service) {
      transporterOptions.service = user.smtpConfig.service;
    }

    const transporter = nodemailer.createTransport(transporterOptions);

    const mailOptions = {
      from: `"${user.name}" <${user.smtpConfig.user}>`,
      to: contact.email,
      subject: `Partnership Opportunity for ${contact.name}`,
      text: `Hi ${contact.name},\n\nWe saw your great work at ${contact.name} and would love to explore a partnership.\n\nBest regards,\n${user.name}`,
      html: `<p>Hi ${contact.name},</p><p>We saw your great work at <strong>${contact.name}</strong> and would love to explore a partnership.</p><br/><p>Best regards,<br/>${user.name}</p>`,
    };

    let status = 'success';
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Nodemailer Error:', emailError);
      status = 'failed';
    }

    // Log the email attempt
    await EmailLog.create({
      userId: user._id,
      businessEmail: contact.email,
      businessName: contact.name,
      status,
    });

    if (status === 'success') {
      user.totalEmailsSent += 1;
      await user.save();
    }

    return NextResponse.json({ message: `Email status: ${status}` });
  } catch (error) {
    console.error('Send Email Error:', error);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
