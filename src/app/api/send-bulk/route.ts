import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmailLog from '@/models/EmailLog';
import CampaignJob from '@/models/CampaignJob';
import Contact from '@/models/Contact';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const contactUrlsRaw = formData.get('contactUrls') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const attachmentFile = formData.get('attachment') as File | null;

    if (!contactUrlsRaw || !subject || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let contactUrls: string[] = [];
    try {
      contactUrls = JSON.parse(contactUrlsRaw);
    } catch (e) {
      return NextResponse.json({ message: 'Invalid contacts data' }, { status: 400 });
    }

    if (contactUrls.length === 0) {
      return NextResponse.json({ message: 'No contacts selected' }, { status: 400 });
    }

    await dbConnect();
    const contacts = await Contact.find({ url: { $in: contactUrls } }).lean();

    if (contacts.length === 0) {
      return NextResponse.json({ message: 'No matching contacts found' }, { status: 400 });
    }

    // Process attachment if exists
    let attachmentBuffer: Buffer | null = null;
    let attachmentName: string | null = null;
    let attachmentType: string | null = null;

    if (attachmentFile && typeof attachmentFile.arrayBuffer === 'function') {
      const arrayBuffer = await attachmentFile.arrayBuffer();
      attachmentBuffer = Buffer.from(arrayBuffer);
      attachmentName = attachmentFile.name;
      attachmentType = attachmentFile.type;
    }

    const userId = (session.user as any).id;
    
    await dbConnect();
    const user = await User.findById(userId);
    if (!user || !user.smtpConfig || !user.smtpConfig.user) {
      return NextResponse.json({ message: 'SMTP_NOT_CONFIGURED' }, { status: 403 });
    }

    const job = await CampaignJob.create({
      userId,
      totalContacts: contacts.length,
      status: 'running',
    });
    
    // We start the processing in the background
    processBulkEmails(userId, contacts, subject, message, {
      buffer: attachmentBuffer,
      name: attachmentName,
      contentType: attachmentType
    }, job._id);

    return NextResponse.json({ message: 'Bulk send initiated', jobId: job._id }, { status: 202 });
  } catch (error) {
    console.error('Send Bulk Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Fire and forget function
async function processBulkEmails(
  userId: string, 
  contacts: any[], 
  templateSubject: string, 
  templateMessage: string,
  attachmentData: { buffer: Buffer | null, name: string | null, contentType: string | null },
  jobId: string
) {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user || !user.smtpConfig || !user.smtpConfig.user) {
      console.error('SMTP not configured for user', userId);
      return;
    }

    const transporterOptions: any = {
      host: user.smtpConfig.host,
      port: user.smtpConfig.port,
      secure: user.smtpConfig.port === 465, // Force true only for 465, false for 587 to use STARTTLS
      auth: {
        user: user.smtpConfig.user,
        pass: user.smtpConfig.password,
      },
    };
    if (user.smtpConfig.service) {
      transporterOptions.service = user.smtpConfig.service;
    }

    const transporter = nodemailer.createTransport(transporterOptions);

    let successCount = 0;

    for (const contact of contacts) {
      if (!contact.email || contact.email === 'N/A') continue;

      // Replace variables dynamically
      let personalizedSubject = templateSubject;
      let personalizedMessage = templateMessage;

      for (const [key, value] of Object.entries(contact)) {
        if (typeof value === 'string') {
          // Replace all occurrences of {key} with the actual value
          const regex = new RegExp(`{${key}}`, 'gi'); // Case-insensitive matching just in case
          personalizedSubject = personalizedSubject.replace(regex, value);
          personalizedMessage = personalizedMessage.replace(regex, value);
        }
      }

      // Fallback if {name} was used but the contact had no name
      personalizedSubject = personalizedSubject.replace(/{name}/gi, 'there');
      personalizedMessage = personalizedMessage.replace(/{name}/gi, 'there');
      
      // Convert line breaks to HTML for the HTML version
      const htmlMessage = personalizedMessage.replace(/\n/g, '<br/>');

      const mailOptions: any = {
        from: `"${user.name}" <${user.smtpConfig.user}>`,
        to: contact.email,
        subject: personalizedSubject,
        text: personalizedMessage,
        html: htmlMessage,
      };

      if (attachmentData.buffer && attachmentData.name) {
        mailOptions.attachments = [
          {
            filename: attachmentData.name,
            content: attachmentData.buffer,
            contentType: attachmentData.contentType || undefined
          }
        ];
      }

      let status = 'success';
      let errorMessage = '';
      try {
        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (emailError: any) {
        console.error(`Failed to send to ${contact.email}:`, emailError);
        status = 'failed';
        errorMessage = emailError.message || emailError.toString();
      }

      // Log it
      await EmailLog.create({
        userId: user._id,
        businessEmail: contact.email,
        businessName: contact.name,
        status,
        ...(errorMessage ? { errorMessage } : {}),
      });

      await CampaignJob.findByIdAndUpdate(jobId, {
        $inc: {
          processedCount: 1,
          successCount: status === 'success' ? 1 : 0,
          failedCount: status === 'failed' ? 1 : 0
        }
      });

      // Simple delay to avoid rate limits (e.g. 1 email per 2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Update total user sent count
    if (successCount > 0) {
      user.totalEmailsSent = (user.totalEmailsSent || 0) + successCount;
      await user.save();
    }
    
    await CampaignJob.findByIdAndUpdate(jobId, { status: 'completed' });
    console.log(`Bulk sending completed for user ${userId}. Sent: ${successCount}/${contacts.length}`);
  } catch (error) {
    console.error('Background Bulk Process Error:', error);
    await CampaignJob.findByIdAndUpdate(jobId, { status: 'failed' }).catch(console.error);
  }
}
