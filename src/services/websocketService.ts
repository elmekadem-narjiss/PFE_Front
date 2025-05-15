import { w3cwebsocket as W3CWebSocket, IMessageEvent, ICloseEvent } from 'websocket';
import { StoredEquipmentData } from '../types/equipment';

const client = new W3CWebSocket('ws://localhost:5000');

let websocketCallbacks: ((data: StoredEquipmentData) => void)[] = [];
let errorCallbacks: ((error: Error) => void)[] = [];
let closeCallbacks: ((event: ICloseEvent) => void)[] = [];

export const connectWebSocket = (
  dataCallback: (data: StoredEquipmentData) => void,
  errorCallback?: (error: Error) => void,
  closeCallback?: (event: ICloseEvent) => void
) => {
  websocketCallbacks.push(dataCallback);
  if (errorCallback) errorCallbacks.push(errorCallback);
  if (closeCallback) closeCallbacks.push(closeCallback);

  client.onopen = () => {
    console.log('WebSocket Client Connected');
  };

  client.onmessage = (message: IMessageEvent) => {
    const data: StoredEquipmentData = JSON.parse(message.data.toString());
    websocketCallbacks.forEach(callback => callback(data));
  };

  client.onclose = (event: ICloseEvent) => {
    console.log('WebSocket Client Disconnected', event);
    closeCallbacks.forEach(callback => callback(event));
  };

  client.onerror = (error: Error) => {
    console.error('WebSocket Error:', error);
    errorCallbacks.forEach(callback => callback(error));
  };
};

export const disconnectWebSocket = () => {
  if (client.readyState === 1) {
    client.close();
  }
};