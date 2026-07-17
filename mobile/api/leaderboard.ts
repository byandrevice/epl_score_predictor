import { client, USE_MOCKS } from './client';
import type { LeaderboardResponse, LeaderboardUser } from './types';

const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, userId: 'mock-1', name: 'Bao Tran', pts: 245, accuracy: '68%', trend: 'same', predictionsPublic: true },
  { rank: 2, userId: 'mock-2', name: 'Tahje', pts: 230, accuracy: '62%', trend: 'up', predictionsPublic: true },
  { rank: 3, userId: 'mock-3', name: 'Eduardo', pts: 225, accuracy: '61%', trend: 'down', predictionsPublic: false },
];

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  if (USE_MOCKS) return mockLeaderboard;
  const { data } = await client.get<LeaderboardResponse>('/leaderboard/top');
  return data.users;
}
