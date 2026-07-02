// Shared API types — mirror the web client (client/src/api) so the backend contract
// is identical across web and mobile.

export interface LoginPayload {
  identity: string; // email or username
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface VerifyPayload {
  email: string;
  code: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string; // JWT on successful auth
}

export interface Fixture {
  id: number;
  home: string;
  homeShort: string;
  homeCrest: string;
  away: string;
  awayShort: string;
  awayCrest: string;
  date: string;
  time: string;
  venue: string;
  week: string;
  predicted: boolean;
  predictedHomeScore: string;
  predictedAwayScore: string;
  homeOdds?: string;
  drawOdds?: string;
  awayOdds?: string;
}

export interface PredictionPayload {
  userId: string;
  fixtureId: number;
  homeScore: string;
  awayScore: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  pts: number;
  accuracy: string;
  trend?: 'up' | 'down' | 'same';
}
