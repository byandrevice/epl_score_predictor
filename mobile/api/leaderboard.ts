import { mockLeaderboard } from '@/mocks/leaderboard';
import { client, USE_MOCKS } from './client';
import type { LeaderboardUser } from './types';

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  if (USE_MOCKS) return mockLeaderboard;
  const { data } = await client.get<LeaderboardUser[]>('/leaderboard/top');
  return data;
}
