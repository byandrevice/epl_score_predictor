// Shared API types — mirror the real backend contract (server/controllers, server/models)
// so mobile and the web client stay in sync.

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
  id: string; // Mongo ObjectId string
  home: string;
  homeShort: string;
  homeLogoUrl: string;
  away: string;
  awayShort: string;
  awayLogoUrl: string;
  date: string; // display string "YYYY-MM-DD"
  time: string; // display string "HH:MM"
  venue: string;
  week: string;
  locked: boolean;
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  predicted?: boolean; // client-only — populated by merging getMyPredictions(), not on the wire
}

export interface PredictionPayload {
  fixtureId: string;
  homeScore: string;
  awayScore: string;
}

export interface Prediction {
  id: string;
  fixtureId: string;
  homeScore: number;
  awayScore: number;
  pointsAwarded: number;
}

export interface SubmitPredictionResponse {
  success: boolean;
  message?: string;
  prediction?: { id: string; fixtureId: string; homeScore: number; awayScore: number };
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  pts: number;
  accuracy: string;
  trend: 'up' | 'down' | 'same';
  predictionsPublic: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  users: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
}

export interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  favoriteTeam: string;
  emailNotifications: boolean;
  reminderNotifications: boolean;
  predictionsPublic: boolean;
  memberSince: string; // ISO date string
}

export interface UserStats {
  rank: number | 'Unranked';
  points: number;
  accuracy: string;
  streak: string; // e.g. "3W"
  correctScores: number;
  predictionsMade: number;
}

export interface PredictionResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  finalHome: number;
  finalAway: number;
  predHome: number;
  predAway: number;
  result: 'correct_score' | 'correct_outcome' | 'wrong';
  points: number;
  matchDate: string; // ISO date string
  venue: string;
  week: string;
}

export interface PredictionStatsResponse {
  summary: {
    pointsThisGameweek: number;
    correctScores: number;
    totalPredictions: number;
    seasonAccuracy: number;
  };
  predictions: PredictionResult[];
}
