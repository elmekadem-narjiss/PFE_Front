// lib/kafka.ts
import { Kafka, Consumer, Producer } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'message-fetcher',
  brokers: ['localhost:9092'],
  logLevel: 4, // Enable DEBUG logging
});

const consumerInstances: Map<string, Consumer> = new Map();
let producerInstance: Producer | null = null;

export const getConsumer = async (groupId: string): Promise<Consumer> => {
  let consumer = consumerInstances.get(groupId);
  if (!consumer) {
    consumer = kafka.consumer({ groupId });
    await consumer.connect();
    consumerInstances.set(groupId, consumer);
  }
  return consumer;
};

export const getProducer = async (): Promise<Producer> => {
  if (!producerInstance) {
    producerInstance = kafka.producer();
    await producerInstance.connect();
  }
  return producerInstance;
};

export const disconnectKafka = async () => {
  for (const consumer of consumerInstances.values()) {
    await consumer.disconnect();
  }
  consumerInstances.clear();
  if (producerInstance) {
    await producerInstance.disconnect();
    producerInstance = null;
  }
};