import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Clock, MapPin, Trophy, ChevronRight, Filter, Calendar, Loader2 } from "lucide-react";

// Importing the true Premier League team data configuration mapping relative to your project structure
import { EPL_TEAMS_DATA } from "../LeagueTeam"; // Adjust the directory prefix if nested differently inside your /src directory

// --- Data Schemas ---
interface Fixture {
  id: number;
  home: string;
  homeShort: string;
  homeCrest: string;
  homeColor: string;
  away: string;
  awayShort: string;
  awayCrest: string;
  awayColor: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  week: string;
  status: string;
  predicted: boolean; // Flag evaluating if the active profile has entry row values saved for this item
  predictedHomeScore?: string | number;
  predictedAwayScore?: string | number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  pts: number;
  accuracy?: string;
  trend?: string;
}

export default function FixturesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("GW38");

  // Live Data State Management
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState({ rank: "—", points: 0, accuracy: "%" });
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://localhost:5001/api";

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userId = userData.id || "guest";
        const token = localStorage.getItem("auth_token"); // Get token for auth
  
        // Ensure token exists before fetching to avoid 401 errors
        if (!token) {
          console.error("No auth token found");
          setLoading(false);
          return;
        }
  
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };
  
        // Perform individual fetches to prevent one failure from blocking others
        const [fixturesRes, leaderboardRes, profileRes] = await Promise.allSettled([
          fetch(`${BACKEND_URL}/fixtures?week=${activeFilter}&userId=${userId}`, { headers }),
          fetch(`${BACKEND_URL}/leaderboard?scope=Overall`, { headers }),
          fetch(`${BACKEND_URL}/user/stats?userId=${userId}`, { headers })
        ]);
  
        // Check status for each
        if (fixturesRes.status === 'fulfilled' && fixturesRes.value.ok) {
          const data = await fixturesRes.value.json();
          console.log("Fixtures received:", data); // Check if 'predicted' is true on any items
          setFixtures(data);
        }
  
        if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.ok) {
          const data = await leaderboardRes.value.json();
          const topFive = (data.users || []).slice(0, 5);
          setLeaderboard(topFive);
        }
  
        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          setUserStats(await profileRes.value.json());
        }
  
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    }
  
    fetchDashboardData();
  }, [activeFilter]); // Re-runs whenever the user changes the filter

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
        {/* Main Feed Column */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h1
                  className="text-2xl font-black tracking-widest uppercase text-foreground"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
                >
                  Upcoming Fixtures
                </h1>
              </div>
              <p className="text-xs text-muted-foreground ml-4 tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                {fixtures.length} matches · {fixtures.filter((f) => !f.predicted).length} unpredicted
              </p>
            </div>

            {/* Filter Pill Actions */}
            <div className="flex items-center gap-1.5">
              <Filter size={11} className="text-muted-foreground mr-1" />
              {["All", "GW38", "GW37", "GW36"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-sm transition-all ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border"
                  }`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Gameweek Info Strip */}
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={12} className="text-muted-foreground" />
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Gameweek 38 · Jul 5–7, 2025
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] tracking-widest text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fixtures.filter((f) => f.predicted).length} / {fixtures.length} predicted
            </span>
          </div>

          {/* Fixture Card Rows */}
          <div className="flex flex-col gap-3">
            {fixtures.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} navigate={navigate} />
            ))}
          </div>
        </section>

        {/* Sidebar Panel containing Leaderboards, Stats, and Deadline Countdown */}
        <SidebarPanels leaderboard={leaderboard} userStats={userStats} fixtures={fixtures} />
      </div>
    </div>
  );
}

// --- Team Crest Component Utilizing EPL_TEAMS_DATA Assets ---
function TeamCrest({ shortName, fallbackEmoji, name }: { shortName: string; fallbackEmoji: string; name: string }) {
  const teamAsset = EPL_TEAMS_DATA[shortName];
  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center p-2 flex-shrink-0">
        {teamAsset?.logoUrl ? (
          <img src={teamAsset.logoUrl} alt={name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-2xl">{fallbackEmoji}</span>
        )}
      </div>
      <span
        className="text-xs font-bold text-foreground text-center leading-tight line-clamp-1"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}
      >
        {name}
      </span>
    </div>
  );
}

// --- High-Fidelity Match Widget ---
function FixtureCard({ fixture, navigate }: { fixture: Fixture; navigate: any }) {
  return (
    <div className={`bg-card rounded-xl border transition-all duration-200 hover:shadow-lg group overflow-hidden ${fixture.predicted ? "border-primary/25 hover:border-primary/40" : "border-border hover:border-border/80"}`}>
      
      {/* Top Banner Details */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-muted/20 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fixture.date}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] tracking-widest font-semibold text-primary uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fixture.time} BST
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase bg-muted/50 px-2 py-0.5 rounded-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fixture.week}
          </span>
          {fixture.predicted && (
            <span className="text-[10px] tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Predicted ✓ {fixture.predictedHomeScore !== undefined && `(${fixture.predictedHomeScore}-${fixture.predictedAwayScore})`}
            </span>
          )}
        </div>
      </div>

      {/* Main Core Match Widget */}
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Home Team Profile */}
        <div onClick={() => navigate(`/dashboard/team/${fixture.homeShort}`)} className="flex-1 flex justify-start cursor-pointer hover:opacity-85 transition-opacity">
          <TeamCrest shortName={fixture.homeShort} fallbackEmoji={fixture.homeCrest} name={fixture.home} />
        </div>

        {/* Center VS Indicator */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 px-2">
          <span className="text-xl font-black text-muted-foreground/30 leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            VS
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fixture.homeShort}
            </span>
            <span className="text-muted-foreground/30 text-[9px]">·</span>
            <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fixture.awayShort}
            </span>
          </div>
        </div>

        {/* Away Team Profile */}
        <div onClick={() => navigate(`/dashboard/team/${fixture.awayShort}`)} className="flex-1 flex justify-end cursor-pointer hover:opacity-85 transition-opacity">
          <TeamCrest shortName={fixture.awayShort} fallbackEmoji={fixture.awayCrest} name={fixture.away} />
        </div>
      </div>

      {/* Stadium Venue + Form action footer */}
      <div className="px-5 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={10} className="text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground tracking-wider truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fixture.venue}
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/predict")}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-all active:scale-[0.97] ${
            fixture.predicted
              ? "bg-muted border border-primary/20 text-primary hover:bg-primary/10"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
        >
          {fixture.predicted ? (
            <>Edit Prediction <ChevronRight size={11} /></>
          ) : (
            <>Predict Score <ChevronRight size={11} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// --- Unified Sidebar incorporating Leaderboards, Stats panels, and Deadlines ---
function SidebarPanels({ leaderboard, userStats, fixtures }: { leaderboard: LeaderboardUser[]; userStats: any; fixtures: Fixture[] }) {
  const navigate = useNavigate();

  const trendIcon = (trend?: string) => {
    if (trend === "up") return <span className="text-primary text-[10px]">▲</span>;
    if (trend === "down") return <span className="text-destructive text-[10px]">▼</span>;
    return <span className="text-muted-foreground text-[10px]">—</span>;
  };

  const totalPredicted = fixtures.filter((f) => f.predicted).length;

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-8">
      
      {/* 1. Leaderboard Table Panel */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-primary" />
            <span className="text-sm font-bold tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>
              Leaderboard
            </span>
          </div>
          <button
            onClick={() => navigate("/dashboard/leaderboard")}
            className="flex items-center gap-1 text-[10px] tracking-widest text-primary uppercase hover:opacity-75 transition-opacity"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Full <ChevronRight size={10} />
          </button>
        </div>

        {/* Table column indicators */}
        <div className="px-5 py-2 flex items-center gap-3 border-b border-border bg-muted/20">
          <span className="w-6 text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#</span>
          <span className="flex-1 text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>User</span>
          <span className="w-10 text-right text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Acc</span>
          <span className="w-14 text-right text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pts</span>
        </div>

        <div className="divide-y divide-border">
          {leaderboard.map((user) => (
            <div key={user.rank} className={`px-5 py-3 flex items-center gap-3 transition-colors hover:bg-muted/20 ${user.rank === 1 ? "bg-primary/5" : ""}`}>
              <div className="w-6 flex items-center gap-1">
                <span className={`text-xs font-bold ${user.rank === 1 ? "text-primary" : "text-muted-foreground"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {user.rank}
                </span>
              </div>
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-bold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className={`text-xs truncate ${user.rank === 1 ? "text-foreground font-semibold" : "text-foreground"}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {user.name}
                </span>
                {trendIcon(user.trend)}
              </div>
              <span className="w-10 text-right text-[10px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {user.accuracy || "65%"}
              </span>
              <span className={`w-14 text-right text-xs font-semibold ${user.rank === 1 ? "text-primary" : "text-foreground"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {user.pts.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic Personal User Stick-Banner Row */}
        <div className="px-5 py-3 bg-muted/30 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-6">
              <span className="text-xs font-bold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>—</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ME</span>
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>You · {userStats.rank}</span>
            </div>
            <span className="w-10 text-right text-[10px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{userStats.accuracy || "58%"}</span>
            <span className="w-14 text-right text-xs font-semibold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{userStats.points}</span>
          </div>
        </div>
      </div>

      {/* 2. Your GW38 Quick Stats Grid Addon Panel */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <span className="text-sm font-bold tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>
            Your GW38 Stats
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border">
          {[
            { label: "Predicted", value: `${totalPredicted} / ${fixtures.length}`, sub: "fixtures" },
            { label: "Points", value: userStats.points || 0, sub: "this week" },
            { label: "Accuracy", value: userStats.accuracy || "0%", sub: "season avg" },
            { label: "Streak", value: userStats.streak || "0W", sub: "correct row" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="px-4 py-4 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
              <span className="text-xl font-black text-foreground">{value}</span>
              <span className="text-[10px] text-muted-foreground/60">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Deadline Countdown Footer Alert */}
      <div className="bg-secondary/60 rounded-xl border border-primary/15 px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] tracking-widest text-primary uppercase font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Deadline
          </span>
        </div>
        <div className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Fri 4 Jul · 19:45
        </div>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
          Lock in your GW38 predictions before kickoff.
        </p>
      </div>
    </aside>
  );
}