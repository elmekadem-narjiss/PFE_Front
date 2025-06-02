import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface EvaluationMetrics {
  total_reward: number;
  cycle_count: number;
  accuracy: number;
  soc_final: number;
}

export interface EvaluationResult {
  Step: number;
  Action: string;
  'SOC (%)': number;
  'Future Production (%)': number;
  Reward: number;
}

export interface EvaluationResponse {
  metrics: EvaluationMetrics;
  results: EvaluationResult[];
  graph_data: string;
}

export const fetchEvaluation = async (): Promise<EvaluationResponse> => {
  try {
    const response = await axios.get<EvaluationResponse>(`${API_BASE_URL}/evaluate`, {
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch evaluation data');
    }
    throw new Error('Unexpected error occurred');
  }
};