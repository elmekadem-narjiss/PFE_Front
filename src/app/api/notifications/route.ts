import { NextRequest } from 'next/server';
import { startConsumer } from '../../../lib/kafka-consumer';
import { subscribeToMessages } from '../../../lib/message-broadcaster';

interface MessageData {
  topic: string;
  partition: number;
  offset: string;
  value: string;
}

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Start consumer (runs once globally)
        await startConsumer();

        // Subscribe to broadcasted messages
        const unsubscribe = subscribeToMessages((data: MessageData) => {
          try {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (error) {
            console.warn('Controller closed, skipping enqueue:', error);
          }
        });

        // Keep the stream alive
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(`data: {"type":"keep-alive"}\n\n`);
          } catch (error) {
            console.warn('Controller closed, stopping keep-alive:', error);
            clearInterval(keepAlive);
          }
        }, 15000);

        // Handle stream cancellation
        request.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          unsubscribe();
        });
      } catch (error) {
        console.error('Error in SSE stream:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}