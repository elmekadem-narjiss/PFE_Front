// src/services/energyService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface PriceResponse {
  price: number;
}

interface Transaction {
  id: number;
  type: string;
  quantity: number;
  price: number;
  profit?: number; // Ajout de profit comme propriété optionnelle
}

interface ManualTradeResponse {
  type: string;
  quantity: number;
  price: number;
  profit: number;
}

interface SocResponse {
  soc: number;
}

export async function fetchLatestPrice(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/energy/prices`);
  if (!response.ok) {
    throw new Error('Failed to fetch latest price');
  }
  const data: PriceResponse[] = await response.json();
  return data[0].price;
}

export async function fetchSoc(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/energy/soc`);
  if (!response.ok) {
    throw new Error('Failed to fetch SOC');
  }
  const data: SocResponse = await response.json();
  return data.soc;
}

export async function executeManualTrade(type: 'buy' | 'sell', quantity: number): Promise<ManualTradeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/energy/trade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, quantity }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to execute manual trade');
  }
  const data: ManualTradeResponse = await response.json();
  return data;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE_URL}/api/energy/transactions`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  const data: Transaction[] = await response.json();
  return data;
}