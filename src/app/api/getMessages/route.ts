import { Kafka } from 'kafkajs';
import { NextResponse } from 'next/server';

const kafka = new Kafka({
  clientId: 'message-fetcher',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'message-fetcher-group' });
const admin = kafka.admin();

export async function GET() {
  try {
    const messages: { content: string; timestamp: string }[] = [];

    // Connecter l'admin et le consommateur
    await admin.connect();
    await consumer.connect();

    // Réinitialiser les offsets à "earliest" pour relire tous les messages
    await admin.resetOffsets({
      groupId: 'message-fetcher-group',
      topic: 'team-messages',
      earliest: true,
    });

    // S'abonner au topic
    await consumer.subscribe({ topic: 'team-messages', fromBeginning: true });

    // Obtenir les offsets finaux pour détecter la fin
    const topicOffsets = await admin.fetchTopicOffsets('team-messages');
    const maxOffset = parseInt(topicOffsets[0].high, 10);

    // Collecter les messages
    await new Promise<void>((resolve) => {
      let isRunning = true;

      consumer.run({
        eachMessage: async ({ message }) => {
          if (!isRunning) return;

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

          messages.push({ content, timestamp });

          // Arrêter si on atteint la fin du topic
          const currentOffset = parseInt(message.offset, 10);
          if (currentOffset >= maxOffset - 1) {
            isRunning = false;
            consumer.stop();
            resolve();
          }
        },
      });
    });

    await consumer.disconnect();
    await admin.disconnect();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages from Kafka:', error);
    await consumer.disconnect();
    await admin.disconnect();
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}