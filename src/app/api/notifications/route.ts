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
            const msg = message.value?.toString() || '';
            console.log(`Message received from Kafka (topic: ${topic}, partition: ${partition}): ${msg}`);
            controller.enqueue(`data: ${JSON.stringify({ message: msg })}\n\n`);
          },
        });
        // Supprimer temporairement l'appel à assignment() pour éviter l'erreur
        // const assignments = await (consumer as any).assignment();
        // console.log('Consumer assignments:', assignments);
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