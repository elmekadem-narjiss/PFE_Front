import { producer } from '@/lib/kafka';
import { NextResponse } from 'next/server';
import { ensureProducerConnected } from '@/lib/kafka';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await ensureProducerConnected();

    // Ajouter un timestamp au message
    const timestamp = new Date().toISOString();
    const messageWithTimestamp = { content: message, timestamp };

    await producer.send({
      topic: 'team-messages',
      messages: [{ value: JSON.stringify(messageWithTimestamp) }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}