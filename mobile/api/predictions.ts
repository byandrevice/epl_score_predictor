import { client, USE_MOCKS } from './client';
import type { AuthResponse, PredictionPayload } from './types';

export async function submitPrediction(payload: PredictionPayload): Promise<AuthResponse> {
  if (USE_MOCKS) return { success: true, message: 'Prediction saved (mock)' };
  const { data } = await client.post<AuthResponse>('/predict', payload);
  return data;
}
