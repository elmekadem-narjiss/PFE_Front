import { EventEmitter } from 'events';

const broadcaster = new EventEmitter();
const MAX_LISTENERS = 100;

broadcaster.setMaxListeners(MAX_LISTENERS);

export function subscribeToMessages(listener: (data: any) => void): () => void {
  const eventName = 'message';
  broadcaster.on(eventName, listener);
  return () => broadcaster.off(eventName, listener);
}

export function broadcastMessage(data: any): void {
  broadcaster.emit('message', data);
}