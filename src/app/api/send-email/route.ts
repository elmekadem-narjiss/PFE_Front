import { NextResponse } from 'next/server';
import { sendBatteryFailureEmail } from '@/lib/emailService';

// POST handler for sending email
export async function POST(request: Request) {
  try {
    const { id, voltage, temperature } = await request.json();

    await sendBatteryFailureEmail({ id, voltage, temperature });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}