// Shared base configuration utility matching your environment setup
const getBaseUrl = (): string => {
    const metaEnv = (import.meta as any).env;
    return metaEnv?.VITE_API_URL || "http://localhost:5001/api";
  };
  
  // Interface definitions matching the AuthPage payloads
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
  
  // Added matching interfaces for the landing data items
  export interface Match {
    id: number;
    home: string;
    homeShort: string;
    away: string;
    awayShort: string;
    homeCrest: string;
    awayCrest: string;
    date: string;
    time: string;
    venue: string;
    homeOdds: string;
    drawOdds: string;
    awayOdds: string;
  }
  
  export interface LeaderboardUser {
    rank: number;
    name: string;
    pts: number;
    accuracy: string;
  }
  
  /**
   * Core Authentication & Public Dashboard API endpoints
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
    }
  };