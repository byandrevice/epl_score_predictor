// client/src/api/index.ts

// Shared base configuration utility matching your environment setup
const getBaseUrl = (): string => {
  const metaEnv = (import.meta as any).env;
  return metaEnv?.VITE_API_URL || "http://localhost:5001/api";
};

// --- Interface Definitions ---
export interface LoginPayload {
  identity: string; // Accepts email or username
  password:  string;
}

export interface RegisterPayload {
  firstName: string;
  lastName:  string;
  username:  string;
  email:     string;
  password:  string;
}

export interface VerifyPayload {
  email: string;
  code:  string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string; // JWT token returned on successful authentication
}

export interface Match {
  id: number;
  home: string;
  homeShort: string;
  away: string;
  awayShort: string;
  // Change these to support the logo URLs
  homeLogoUrl: string; 
  awayLogoUrl: string;
  date: string;
  time: string;
  venue: string;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  pts: number;
  accuracy: string;
  trend: "up" | "down" | "same";
  isCurrentUser?: boolean;
}

/**
 * Core Authentication & Dashboard API Endpoints Bridge
 */
export const authApi = {
  /**
   * Submit credentials to establish a user session token
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await fetch(`${getBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid credentials provided.");
    }
    return data;
  },

  /**
   * Register a new predictor account profile
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await fetch(`${getBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration fields submission invalid.");
    }
    return data;
  },

  /**
   * Verify the 6-digit email confirmation code
   */
  verifyEmail: async (payload: VerifyPayload): Promise<AuthResponse> => {
    const response = await fetch(`${getBaseUrl()}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid or incorrect verification security code.");
    }
    return data;
  },

  /**
   * Request a new 6-digit confirmation code delivery link
   */
  resendCode: async (email: string): Promise<{ success: boolean; message?: string }> => {
    const response = await fetch(`${getBaseUrl()}/auth/resend-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to resend authentication verification code.");
    }
    return data;
  },

  /**
   * Fetch live upcoming fixtures for landing screen
   */
  getLandingMatches: async (): Promise<Match[]> => {
    const response = await fetch(`${getBaseUrl()}/fixtures/upcoming`);
    if (!response.ok) throw new Error("Failed to load live fixtures");
    return response.json();
  },
  
  /**
   * Fetch global leaderboard metrics for landing widget
   */
  getLandingLeaderboard: async (): Promise<LeaderboardUser[]> => {
    const response = await fetch(`${getBaseUrl()}/leaderboard/top`);
    if (!response.ok) throw new Error("Failed to load live leaderboard");
    return response.json();
  },
  
  /**
   * Fetch active dashboard rankings filtered by scope ("Overall" | "GW38" | "Friends")
   */
  getLeaderboard: async (scope: string, token: string): Promise<{ users: LeaderboardUser[]; currentUser: LeaderboardUser }> => {
    const response = await fetch(`${getBaseUrl()}/leaderboard?scope=${scope}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to load the active leaderboard standings.");
    }
    return response.json();
  },

  /**
   * Fetch fixtures schedule filtered by Gameweek or User Context
   */
  getFixtures: async (week: string, userId: string, token: string): Promise<any> => {
    const response = await fetch(`${getBaseUrl()}/fixtures?week=${week}&userId=${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch live match fixtures data.");
    }
    return response.json();
  },

  /**
   * Fetch user account prediction stats summary matrix
   */
  getUserStats: async (userId: string, token: string): Promise<any> => {
    const response = await fetch(`${getBaseUrl()}/user-stats?userId=${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to parse dynamic live metrics from backend.");
    }
    return response.json();
  },

  /**
   * Fetch current ongoing prediction round matches
   */
  getPredictFixtures: async (token: string): Promise<any> => {
    const response = await fetch(`${getBaseUrl()}/predictions/fixtures`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve current layout configuration prediction fixtures.");
    }
    return response.json();
  }
};

// Add this to the bottom of client/src/api/index.ts

// client/src/api/index.ts

export const teamApi = {
  getTeamDetails: async (teamId: string, token: string): Promise<any> => {
    const response = await fetch(`${getBaseUrl()}/teams/${teamId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to parse backend team metrics.");
    }
    return data.data; // Returns the database document item safely
  }
};

export const statsApi = {
  // Fetch league table
  getTable: async (season: string, token: string): Promise<any> => {
    const response = await fetch(`${getBaseUrl()}/stats/table?season=${season}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
  },

  // Fetch user prediction history
  getUserPredictions: async (userId: string, token: string): Promise<any> => {
    const response = await fetch(`${getBaseUrl()}/stats/predictions/${userId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
  }
};