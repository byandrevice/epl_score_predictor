import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import { Clock, MapPin, Trophy, ChevronRight, Filter, Calendar, Loader2, Save } from "lucide-react";

// --- Types for strict live data rendering ---
interface Fixture {
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
  predictedHomeScore?: string | number;
  predictedAwayScore?: string | number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  pts: number;
  accuracy: string;
  trend: "up" | "down" | "same";
}

export default function FixturesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("GW38");
  
  // App States for Live Data Pipeline
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState({ rank: "—", points: 0, accuracy: "0%", count: "0/0" });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = "http://localhost:5001/api";

  // --- 1. Fetch live data from backend server ---
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userId = userData.id || "guest";

        // Fetch fixtures, leaderboard, and personalized user placement concurrently
        const [fixturesRes, leaderboardRes, profileRes] = await Promise.all([
          fetch(`${BACKEND_URL}/fixtures?week=${activeFilter}&userId=${userId}`),
          fetch(`${BACKEND_URL}/leaderboard`),
          fetch(`${BACKEND_URL}/user-stats?userId=${userId}`)
        ]);

        if (!fixturesRes.ok || !leaderboardRes.ok || !profileRes.ok) {
          throw new Error("Failed to receive valid server data.");
        }

        const fixturesData = await fixturesRes.json();
        const leaderboardData = await leaderboardRes.json();
        const profileData = await profileRes.json();

        setFixtures(fixturesData);
        setLeaderboard(leaderboardData);
        setUserStats(profileData);
        } catch (err: any) {
          
          /*******************************************************************************
           * 🚨 ATTENTION DEVELOPER: DELETE THIS ENTIRE BLOCK WHEN THE API IS READY 🚨
           * 
           * PURPOSE:
           * This 'catch' block acts as a front-end safety net. Since your backend API team 
           * hasn't started the live server yet, your fetch calls will naturally fail. 
           * Instead of locking you out with a "Network Connection Error" screen, this block 
           * intercepts the error and populates your UI layout fields with high-fidelity, 
           * hardcoded mockup match configurations.
           * 
           * WHEN TO DELETE:
           * Remove this entire fallback catch block as soon as your local API server is online 
           * and successfully serving JSON payloads from:
           *    - GET /api/fixtures
           *    - GET /api/leaderboard
           *    - GET /api/user-stats
           * 
           * PRODUCTION STATUS: UNFIT FOR DEPLOYMENT (LOCAL TESTING ONLY)
           ******************************************************************************/
          
          console.warn("Backend offline, utilizing development mockup arrays.");
          
          setFixtures([
            {
              id: 1,
              home: "Arsenal",
              homeShort: "ARS",
              homeCrest: "🔴",
              away: "Manchester City",
              awayShort: "MCI",
              awayCrest: "🩵",
              date: "May 19, 2026",
              time: "16:00",
              venue: "Emirates Stadium",
              week: "GW38",
              predicted: false
            },
            {
              id: 2,
              home: "Chelsea",
              homeShort: "CHE",
              away: "Liverpool",
              awayShort: "LIV",
              homeCrest: "🔵",
              awayCrest: "🔺",
              date: "May 19, 2026",
              time: "16:00",
              venue: "Stamford Bridge",
              week: "GW38",
              predicted: true,
              predictedHomeScore: 2,
              predictedAwayScore: 1
            }
          ]);

          setLeaderboard([
            { rank: 1, name: "GoonerPredicts", pts: 345, accuracy: "68%", trend: "up" },
            { rank: 2, name: "PepTactics", pts: 340, accuracy: "65%", trend: "same" }
          ]);

          setUserStats({ rank: "#4,120", points: 210, accuracy: "52%", count: "14/38" });
          
          /*******************************************************************************
           * END OF DEVMOCK INTERCEPTOR BLOCK
           * 
           * Replace with this after api avalible --- 
            } catch (err: any) {
              // Standard production error handling:
              setError(err.message || "Something went wrong.");
            } finally {
           ******************************************************************************/

        } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [activeFilter]); 

  // --- 2. Dynamic Input Handler for User Predictions ---
  const handleScoreInputChange = (fixtureId: number, team: 'home' | 'away', value: string) => {
    const numericValue = value.replace(/\D/g, ""); 
    setFixtures(prev => prev.map(f => {
      if (f.id === fixtureId) {
        return {
          ...f,
          [team === 'home' ? 'predictedHomeScore' : 'predictedAwayScore']: numericValue
        };
      }
      return f;
    }));
  };

  // --- 3. Save Score Submission via Live HTTP POST Network Request ---
  const handleSavePrediction = async (fixtureId: number) => {
    const targetMatch = fixtures.find(f => f.id === fixtureId);
    if (!targetMatch) return;

    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const payload = {
        userId: userData.id,
        fixtureId: targetMatch.id,
        homeScore: targetMatch.predictedHomeScore,
        awayScore: targetMatch.predictedAwayScore,
      };

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Could not save prediction.");

      setFixtures(prev => prev.map(f => f.id === fixtureId ? { ...f, predicted: true } : f));
      alert("Prediction saved successfully!");
    } catch (err: any) {
      // Dev mode save fallback simulation
      setFixtures(prev => prev.map(f => f.id === fixtureId ? { ...f, predicted: true } : f));
      alert("Dev Mode Sync Notice: Saved match state locally!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-xs text-muted-foreground uppercase font-semibold tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Loading Live Matchday Data...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        
        {/* MAIN COLUMN: LIVE FIXTURES LIST */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h1 className="text-2xl font-black tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Live Match Center
                </h1>
              </div>
              <p className="text-xs text-muted-foreground ml-4">{fixtures.length} Live Fixtures Retrieved</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5">
              {["All", "GW38", "GW37"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-sm transition-all ${
                    activeFilter === f ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground border border-border"
                  }`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Match Iterator Cards */}
          <div className="flex flex-col gap-3">
            {fixtures.map((fixture) => (
              <div key={fixture.id} className={`bg-card rounded-xl border p-4 ${fixture.predicted ? 'border-primary/20' : 'border-border'}`}>
                {/* Info row */}
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold mb-3 tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <div className="flex gap-2">
                    <span>{fixture.date}</span>
                    <span className="text-primary">{fixture.time} BST</span>
                  </div>
                  <span>{fixture.venue}</span>
                </div>

                {/* Main Match Container Row */}
                <div className="grid grid-cols-3 items-center text-center gap-2 mb-4">
                  {/* Home Team (Fixed navigation path parameter targeting team shortcode string here) */}
                  <div 
                    onClick={() => navigate(`/dashboard/team/${fixture.homeShort}`)}
                    className="flex flex-col items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span className="text-xl">{fixture.homeCrest}</span>
                    <span className="text-sm font-bold truncate max-w-[110px]">{fixture.home}</span>
                  </div>

                  {/* Input Score Boxes */}
                  <div className="flex items-center justify-center gap-1.5">
                    <input
                      type="text"
                      className="w-10 h-10 bg-muted/50 border border-border rounded-md text-center text-sm font-bold outline-none focus:border-primary"
                      value={fixture.predictedHomeScore ?? ""}
                      placeholder="-"
                      onChange={(e) => handleScoreInputChange(fixture.id, 'home', e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground font-black">V</span>
                    <input
                      type="text"
                      className="w-10 h-10 bg-muted/50 border border-border rounded-md text-center text-sm font-bold outline-none focus:border-primary"
                      value={fixture.predictedAwayScore ?? ""}
                      placeholder="-"
                      onChange={(e) => handleScoreInputChange(fixture.id, 'away', e.target.value)}
                    />
                  </div>

                  {/* Away Team (Added clickable navigation element here for full UI alignment symmetry) */}
                  <div 
                    onClick={() => navigate(`/dashboard/team/${fixture.awayShort}`)}
                    className="flex flex-col items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span className="text-xl">{fixture.awayCrest}</span>
                    <span className="text-sm font-bold truncate max-w-[110px]">{fixture.away}</span>
                  </div>
                </div>

                {/* Save Confirmation Button Layout */}
                <div className="flex justify-end pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleSavePrediction(fixture.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold rounded-sm hover:opacity-90"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    <Save size={12} />
                    <span>{fixture.predicted ? "Update Pick" : "Lock In Score"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SIDEBAR COLUMN: RENDERED DYNAMICALLY FROM SERVER DATA */}
        <aside className="flex flex-col gap-5">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2 border-b border-border">
              <Trophy size={14} className="text-primary" />
              <span className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Live Leaderboard</span>
            </div>
            <div className="divide-y divide-border">
              {leaderboard.map((user) => (
                <div key={user.rank} className="px-5 py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.rank}</span>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                  <span className="font-bold text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.pts} pts</span>
                </div>
              ))}
            </div>

            {/* Dynamic Local User Sidebar Section */}
            <div className="px-5 py-3 bg-muted/30 border-t border-border text-xs flex justify-between font-bold">
              <span className="text-muted-foreground">You · Rank {userStats.rank}</span>
              <span className="text-foreground">{userStats.points} Pts</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}