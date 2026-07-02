import type { LeaderboardUser } from '@/api/types';

export const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: 'Bao Tran', pts: 245, accuracy: '68%', trend: 'same' },
  { rank: 2, name: 'Tahje', pts: 230, accuracy: '62%', trend: 'up' },
  { rank: 3, name: 'Eduardo', pts: 225, accuracy: '61%', trend: 'down' },
  { rank: 4, name: 'Andre', pts: 210, accuracy: '58%', trend: 'up' },
  { rank: 5, name: 'Priya', pts: 198, accuracy: '55%', trend: 'same' },
];
