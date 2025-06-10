import { NextRequest } from 'next/server';

let storedSettings = {
  pipeline: { ciCdEnabled: true, retrainFrequency: 'daily', modelVersion: 'v1.0' },
  energy: { demandThreshold: 100, optimizationMode: 'balanced' },
  battery: { healthThreshold: 80, alertOnDegradation: true },
  kafka: { broker: 'localhost:9092', topic: 'team-messages', groupId: 'message-fetcher-group' },
  user: { notificationsEnabled: true, theme: 'light' },
};

export async function GET() {
  return new Response(JSON.stringify(storedSettings), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const newSettings = await request.json();
    storedSettings = { ...storedSettings, ...newSettings };
    return new Response(JSON.stringify({ message: 'Settings saved' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}