// app/api/getMessages/route.ts
import { NextResponse } from 'next/server';
import { Admin, ITopicMetadata } from 'kafkajs';
import { kafka, getConsumer } from '@/lib/kafka';

export async function GET() {
  const consumer = await getConsumer('message-fetcher-group');
  const admin: Admin = kafka.admin();

  try {
    await admin.connect();

    // Correct typing for fetchTopicMetadata
    const topicMetadata: { topics: ITopicMetadata[] } = await admin.fetchTopicMetadata({ topics: ['team-messages'] });
    if (!topicMetadata.topics.some((t: { name: string }) => t.name === 'team-messages')) {
      throw new Error("Topic 'team-messages' does not exist");
    }

    await consumer.subscribe({ topic: 'team-messages', fromBeginning: true });

    const messages: { content: string; timestamp: string }[] = [];
    let isDone = false;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        isDone = true;
        resolve();
      }, 5000);

      consumer
        .run({
          eachMessage: async ({ message }) => {
            if (isDone) return;

            const rawMessage = message.value?.toString() || '';
            let content: string, timestamp: string;

            try {
              const msgData = JSON.parse(rawMessage);
              content = msgData.content || rawMessage;
              timestamp = msgData.timestamp || new Date().toISOString();
            } catch (error) {
              content = rawMessage;
              timestamp = new Date().toISOString();
            }

            messages.push({ content, timestamp });

            if (messages.length >= 100) {
              isDone = true;
              resolve();
            }
          },
          autoCommit: false,
        })
        .catch(reject);

      return () => clearTimeout(timeout);
    });

    await admin.disconnect();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages from Kafka:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await admin.disconnect().catch((err: unknown) => console.warn('Error disconnecting admin:', err));
    return NextResponse.json({ error: `Failed to fetch messages: ${errorMessage}` }, { status: 500 });
  }
}