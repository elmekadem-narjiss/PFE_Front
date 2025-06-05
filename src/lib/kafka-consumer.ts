import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { broadcastMessage } from './message-broadcaster';

let consumerInstance: Consumer | null = null;
let isRunning = false;

export async function getConsumer(): Promise<Consumer> {
  if (consumerInstance) {
    return consumerInstance;
  }

  const kafka = new Kafka({
    clientId: 'chat-app',
    brokers: ['localhost:9092'],
  });

  consumerInstance = kafka.consumer({
    groupId: 'message-fetcher-group',
    sessionTimeout: 30000, // Increase to reduce rebalancing
    rebalanceTimeout: 60000,
    heartbeatInterval: 3000, // Frequent heartbeats to avoid timeouts
  });

  await consumerInstance.connect();
  await consumerInstance.subscribe({
    topic: 'team-messages',
    fromBeginning: true,
  });

  return consumerInstance;
}

export async function startConsumer(): Promise<void> {
  if (isRunning) {
    return;
  }

  const consumer = await getConsumer();
  isRunning = true;

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      const data = {
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString() ?? '',
      };
      broadcastMessage(data);
    },
  });
}

export async function shutdownConsumer(): Promise<void> {
  if (consumerInstance && isRunning) {
    await consumerInstance.disconnect();
    consumerInstance = null;
    isRunning = false;
  }
}