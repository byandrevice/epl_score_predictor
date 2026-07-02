// Shared base configuration using your Vite environment rules safely
const getBaseUrl = (): string => {
    const metaEnv = (import.meta as any).env;
    return metaEnv?.VITE_API_URL || "http://localhost:5001/api";
  };
  
  // Strict interface matching what DashboardLayout's useLoaderData expects
  export interface DashboardMetaResponse {
    username: string;
    avatarInitials: string;
    globalRank: string;
    gameweekNumber: number;
    gameweekIsOpen: boolean;
    deadlineText: string;
  }
  
  /**
   * Reusable utility for handling authenticated API requests
   */
  async function fetchSecure<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("auth_token"); // Adjust based on your cookie/localStorage token strategy
    
    const headers = new Headers({
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options?.headers,
    });
  
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      ...options,
      headers,
    });
  
    if (response.status === 401 || response.status === 403) {
      // Session expired or unauthenticated management
      localStorage.removeItem("auth_token");
      throw new Error("UNAUTHORIZED_SESSION");
    }
  
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText} (${response.status})`);
    }
  
    return response.json() as Promise<T>;
  }
  
  /**
   * Dashboard Layout API calls
   */
  export const dashboardApi = {
    /**
     * Fetches the structural layout metrics (user rank, current gameweek rules)
     */
    getLayoutMeta: async (): Promise<DashboardMetaResponse> => {
      return fetchSecure<DashboardMetaResponse>("/user/dashboard-meta");
    },
  
    /**
     * Triggers server-side session revocation
     */
    logoutSession: async (): Promise<{ success: boolean }> => {
      return fetchSecure<{ success: boolean }>("/auth/logout", {
        method: "POST"
      });
    }
  };