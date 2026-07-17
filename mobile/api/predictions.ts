import { client, USE_MOCKS } from './client';
import type { Prediction, PredictionPayload, PredictionStatsResponse, SubmitPredictionResponse } from './types';

export async function submitPrediction(payload: PredictionPayload): Promise<SubmitPredictionResponse> {
  if (USE_MOCKS) return { success: true, message: 'Prediction saved (mock)' };
  const { data } = await client.post<SubmitPredictionResponse>('/predict', payload);
  return data;
}

export async function getMyPredictions(): Promise<Prediction[]> {
  if (USE_MOCKS) return [];
  const { data } = await client.get<Prediction[]>('/predictions/mine');
  return data;
}

// Named getPredictionStats (not getStats) to avoid colliding with api/user.ts's
// getStats(), which hits a different endpoint (/user/stats) with a different shape.
export async function getPredictionStats(): Promise<PredictionStatsResponse> {
  if (USE_MOCKS) {
    return { summary: { pointsThisGameweek: 0, correctScores: 0, totalPredictions: 0, seasonAccuracy: 0 }, predictions: [] };
  }
  const { data } = await client.get<PredictionStatsResponse>('/predictions/stats');
  return data;
}
