import { producer, ensureProducerConnected } from '@/lib/kafka';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // S'assurer que le producteur est connecté
    await ensureProducerConnected();

    await producer.send({
      topic: 'team-messages',
      messages: [{ value: message }],
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}