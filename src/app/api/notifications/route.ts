import { consumer } from '@/lib/kafka';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log('Starting consumer for notifications');
        await consumer.subscribe({ topic: 'team-messages', fromBeginning: true });
        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            const rawMessage = message.value?.toString() || '';
            let content, timestamp;

            try {
              const msgData = JSON.parse(rawMessage);
              if (msgData.content && msgData.timestamp) {
                content = msgData.content;
                timestamp = msgData.timestamp;
              } else {
                content = rawMessage;
                timestamp = new Date().toISOString();
              }
            } catch (error) {
              content = rawMessage;
              timestamp = new Date().toISOString();
            }

            console.log(`Message received from Kafka (topic: ${topic}, partition: ${partition}): ${content} at ${timestamp}`);
            console.log('Sending via SSE:', { content, timestamp });
            controller.enqueue(`data: ${JSON.stringify({ content, timestamp })}\n\n`);
          },
        });
      } catch (error) {
        console.error('Error consuming messages from Kafka:', error);
        controller.close();
      }
    },
    cancel() {
      consumer.disconnect();
    },
  });

  return new Response(stream, { headers });
}