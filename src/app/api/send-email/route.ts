import { NextResponse } from 'next/server';
import { sendBatteryFailureEmail } from '@/lib/emailService';

// POST handler for sending email
export async function POST(request: Request) {
  try {
    const { id, voltage, temperature } = await request.json();

    if (!id || voltage === undefined || temperature === undefined) {
      return NextResponse.json(
        { error: 'Invalid input: id, voltage, and temperature are required' },
        { status: 400 }
      );
    }

    const result = await sendBatteryFailureEmail({ id, voltage, temperature });

    return NextResponse.json(
      { message: result.message, response: result.response },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in send-email API:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}