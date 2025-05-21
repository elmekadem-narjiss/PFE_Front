import { Kafka } from 'kafkajs';
import { NextResponse } from 'next/server';

// Créer une nouvelle instance de Kafka pour ce consommateur
const kafka = new Kafka({
  clientId: 'message-fetcher',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'message-fetcher-group' });

export async function GET() {
  try {
    const messages: { content: string; timestamp: string }[] = [];

    // Connecter et s'abonner au topic
    await consumer.connect();
    await consumer.subscribe({ topic: 'team-messages', fromBeginning: true });

    // Collecter les messages
    await new Promise<void>((resolve) => {
      consumer.run({
        eachMessage: async ({ message }) => {
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
        },
      });

      // Arrêter après un court délai
      setTimeout(() => {
        consumer.stop();
        resolve();
      }, 2000); // Augmenter le délai si nécessaire pour lire tous les messages
    });

    await consumer.disconnect();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages from Kafka:', error);
    await consumer.disconnect(); // Déconnexion en cas d'erreur
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}