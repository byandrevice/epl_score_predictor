import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, XCircle, MinusCircle, Star, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Types matching predictionController.getStats()'s response exactly ───
type PredictionResult = "correct_score" | "correct_outcome" | "wrong";


interface LeagueTeam {
  _id?: string;   
  pos: number;
  name: string;
  short: string;
  crest: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: FormResult[];
  trend: "up" | "down" | "same";
  highlighted?: boolean; 
}

interface StatsSummary {
  pointsThisGameweek: number;
  correctScores: number;
  totalPredictions: number;
  seasonAccuracy: number;
}

interface StatsResponse {
  summary: StatsSummary;
  predictions: PredictionCard[];
}

// ─── League Table Data ─────────────────────────────────────────────────────

type FormResult = "W" | "D" | "L";

interface LeagueTeam {
  pos: number;
  name: string;
  short: string;
  crest: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: FormResult[];
  trend: "up" | "down" | "same";
  highlighted?: boolean; // Keep this so we can highlight the user's followed team!
}

async function fetchLeagueTable(week: string, season: string): Promise<LeagueTeam[]> {
  const metaEnv = (import.meta as any).env;
  const baseUrl = metaEnv?.VITE_API_URL || "http://localhost:5001/api";
  const token = localStorage.getItem("auth_token");

  const queryWeek = week; // let the backend handle "All" itself

  const querySeason = season; 

  const res = await fetch(`${baseUrl}/stats/table?week=${queryWeek}&season=${querySeason}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

// ─── Gradient configs per result type ─────────────────────────────────────

const RESULT_CONFIG = {
  correct_score: {
    label: "Correct Score",
    badgeBg: "linear-gradient(135deg, rgba(57,255,20,0.25) 0%, rgba(34,197,94,0.15) 100%)",
    badgeBorder: "rgba(57,255,20,0.4)",
    badgeGlow: "0 0 20px rgba(57,255,20,0.25), 0 0 40px rgba(57,255,20,0.1)",
    pointsGradient: "linear-gradient(135deg, #39ff14 0%, #22c55e 100%)",
    pointsColor: "#030603",
    iconColor: "#39ff14",
    Icon: CheckCircle2,
    cardBorder: "rgba(57,255,20,0.2)",
    cardGlow: "0 4px 32px rgba(57,255,20,0.08)",
    cardBg: "linear-gradient(160deg, rgba(57,255,20,0.06) 0%, rgba(15,20,15,0.0) 60%)",
  },
  correct_outcome: {
    label: "Correct Outcome",
    badgeBg: "linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(245,158,11,0.15) 100%)",
    badgeBorder: "rgba(251,191,36,0.4)",
    badgeGlow: "0 0 20px rgba(251,191,36,0.25), 0 0 40px rgba(251,191,36,0.08)",
    pointsGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    pointsColor: "#1a0e00",
    iconColor: "#fbbf24",
    Icon: MinusCircle,
    cardBorder: "rgba(251,191,36,0.18)",
    cardGlow: "0 4px 32px rgba(251,191,36,0.07)",
    cardBg: "linear-gradient(160deg, rgba(251,191,36,0.05) 0%, rgba(15,20,15,0.0) 60%)",
  },
  wrong: {
    label: "No Points",
    badgeBg: "linear-gradient(135deg, rgba(100,116,139,0.2) 0%, rgba(71,85,105,0.12) 100%)",
    badgeBorder: "rgba(100,116,139,0.25)",
    badgeGlow: "none",
    pointsGradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
    pointsColor: "#e2e8f0",
    iconColor: "#64748b",
    Icon: XCircle,
    cardBorder: "rgba(100,116,139,0.15)",
    cardGlow: "0 4px 24px rgba(0,0,0,0.2)",
    cardBg: "linear-gradient(160deg, rgba(100,116,139,0.04) 0%, rgba(15,20,15,0.0) 60%)",
  },
};

// ─── Form badge gradient configs ───────────────────────────────────────────

const FORM_CONFIG: Record<FormResult, { bg: string; shadow: string; text: string; border: string }> = {
  W: {
    bg: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    shadow: "0 2px 12px rgba(52,211,153,0.45), 0 0 0 1px rgba(52,211,153,0.2)",
    text: "#fff",
    border: "transparent",
  },
  D: {
    bg: "linear-gradient(135deg, #fcd34d 0%, #d97706 100%)",
    shadow: "0 2px 12px rgba(252,211,77,0.35), 0 0 0 1px rgba(252,211,77,0.2)",
    text: "#1a0e00",
    border: "transparent",
  },
  L: {
    bg: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
    shadow: "0 2px 12px rgba(248,113,113,0.35), 0 0 0 1px rgba(248,113,113,0.15)",
    text: "#fff",
    border: "transparent",
  },
};

// ─── API Service ───────────────────────────────────────────────────────────

async function fetchStats(week: string, year: string): Promise<StatsResponse> {
  const metaEnv = (import.meta as any).env;
  const baseUrl = metaEnv?.VITE_API_URL || "http://localhost:5001/api";
  const token = localStorage.getItem("auth_token");

  // Format week param (e.g. converting "All" to empty query string or passing raw)
  const weekParam = week !== "All" ? `&week=${week}` : "";
  const res = await fetch(`${baseUrl}/predictions/stats?year=${year}${weekParam}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("auth_token");
    throw new Error("UNAUTHORIZED_SESSION");
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText} (${res.status})`);
  }
  return res.json();
}

// ─── UI Components ────────────────────────────────────────────────────────────

function FormBadge({ result }: { result: FormResult }) {
  const cfg = FORM_CONFIG[result];
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: cfg.bg, boxShadow: cfg.shadow }}
    >
      <span
        className="text-[10px] font-black"
        style={{ color: cfg.text, fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {result}
      </span>
    </div>
  );
}

function PredictionOutcomeCard({ card }: { card: PredictionCard }) {
  const cfg = RESULT_CONFIG[card.result];
  const Icon = cfg.Icon;
  const formattedDate = new Date(card.matchDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl backdrop-blur-sm"
      style={{
        background: `${cfg.cardBg}, rgba(18,21,18,0.75)`,
        border: `1px solid ${cfg.cardBorder}`,
        boxShadow: cfg.cardGlow,
      }}
    >
      {/* Subtle top-edge highlight */}
      <div
        className="absolute top-0 left-8 right-8 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.badgeBorder}, transparent)` }}
      />

      {/* Star badge for correct scores */}
      {card.result === "correct_score" && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md z-10">
          <Star size={11} className="text-primary-foreground" fill="currentColor" />
        </div>
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color: cfg.iconColor }} />
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: cfg.iconColor, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {cfg.label}
          </span>
        </div>
        <span
          className="text-[10px] tracking-wider text-muted-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {formattedDate}
        </span>
      </div>

      {/* Teams row */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1.5">
          {/* Home Crest */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {card.homeCrest.startsWith("http") ? (
              <img src={card.homeCrest} alt={card.homeTeam} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-2xl">{card.homeCrest}</span>
            )}
          </div>
          <span
            className="text-xs font-bold text-foreground tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {card.homeTeam}
          </span>
        </div>

        {/* Score block */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {/* Final Score */}
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-[9px] tracking-widest text-muted-foreground/60 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Final Score
            </span>
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span
                className="text-2xl font-black text-foreground"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {card.finalHome}
              </span>
              <span className="text-sm text-muted-foreground/40 font-light">–</span>
              <span
                className="text-2xl font-black text-foreground"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {card.finalAway}
              </span>
            </div>
          </div>

          {/* Your Prediction */}
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-[9px] tracking-widest text-muted-foreground/50 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Your Prediction
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="text-base font-bold text-muted-foreground"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {card.predHome}
              </span>
              <span className="text-xs text-muted-foreground/30">–</span>
              <span
                className="text-base font-bold text-muted-foreground"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {card.predAway}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          {/* Home Crest */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {card.awayCrest.startsWith("http") ? (
              <img src={card.awayCrest} alt={card.awayTeam} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-2xl">{card.awayCrest}</span>
            )}
          </div>
          <span
            className="text-xs font-bold text-foreground tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {card.awayTeam}
          </span>
        </div>
      </div>

      {/* Points badge */}
      <div className="px-5 pb-5">
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl backdrop-blur-md"
          style={{
            background: cfg.badgeBg,
            border: `1px solid ${cfg.badgeBorder}`,
            boxShadow: cfg.badgeGlow,
          }}
        >
          <span
            className="text-xs tracking-widest uppercase font-semibold text-foreground/70"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Points Earned
          </span>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1 rounded-lg text-sm font-black"
              style={{
                background: cfg.pointsGradient,
                color: cfg.pointsColor,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              +{card.points}
            </div>
            <span
              className="text-[10px] text-foreground/40 tracking-wider"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeagueTableRow({ team, index }: { team: LeagueTeam; index: number }) {
  const TrendIcon = team.trend === "up" ? TrendingUp : team.trend === "down" ? TrendingDown : Minus;
  const trendColor = team.trend === "up" ? "#34d399" : team.trend === "down" ? "#f87171" : "#64748b";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group relative"
      style={{
        background: team.highlighted
          ? "linear-gradient(90deg, rgba(57,255,20,0.07) 0%, rgba(57,255,20,0.03) 100%)"
          : index % 2 === 0
          ? "rgba(255,255,255,0.025)"
          : "transparent",
        border: team.highlighted
          ? "1px solid rgba(57,255,20,0.18)"
          : "1px solid transparent",
      }}
    >
      {/* Pos + trend */}
      <div className="w-8 flex items-center gap-1 flex-shrink-0">
        <span
          className={`text-xs font-bold w-4 text-center ${team.pos <= 4 ? "text-primary" : "text-muted-foreground"}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {team.pos}
        </span>
        <TrendIcon size={9} style={{ color: trendColor }} strokeWidth={2.5} />
      </div>

      {/* Club */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {team.crest.startsWith("http") ? (
          <img src={team.crest} alt={team.name} className="w-5 h-5 object-contain" />
        ) : (
          <span className="text-base">{team.crest}</span>
        )}
      </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-semibold text-foreground leading-tight truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {team.name}
          </span>
          {team.highlighted && (
            <span
              className="text-[9px] text-primary tracking-wider"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              YOU FOLLOW
            </span>
          )}
        </div>
      </div>

      {/* Stats — hidden on small */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        {[
          { label: "P", value: team.played },
          { label: "W", value: team.won },
          { label: "D", value: team.drawn },
          { label: "L", value: team.lost },
          { label: "GD", value: team.gd > 0 ? `+${team.gd}` : team.gd },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 w-7">
            <span
              className="text-[9px] tracking-widest text-muted-foreground/50 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {label}
            </span>
            <span
              className="text-xs text-foreground/70"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Form badges */}
      <div className="w-28 flex items-center justify-center gap-1 flex-shrink-0">
        {team.form.map((f, i) => <FormBadge key={i} result={f} />)}
      </div>

      {/* Points */}
      <div className="w-10 text-right flex-shrink-0">
        <span
          className={`text-sm font-black ${team.pos <= 4 ? "text-primary" : "text-foreground"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {team.pts}
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 rounded-full bg-primary" />
      <h2
        className="text-lg font-black tracking-widest uppercase text-foreground"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
      >
        {children}
      </h2>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function StatsGallery() {
  const [activeTab, setActiveTab] = useState<"all" | "correct" | "wrong">("all");
  const [activeFilter, setActiveFilter] = useState("GW1");
  const [selectedYear, setSelectedYear] = useState("2025")
  
  const [tableData, setTableData] = useState<LeagueTeam[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [summary, setSummary] = useState<StatsSummary>({
    pointsThisGameweek: 0,
    correctScores: 0,
    totalPredictions: 0,
    seasonAccuracy: 0,
  });
  const [predictions, setPredictions] = useState<PredictionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  let cancelled = false;

  async function load() {
    setLoading(true);
    setTableLoading(true);
    
    // 1. Clear previous data immediately so the UI doesn't show old teams!
    setTableData([]); 
    setError(null);

    try {
      // Fetch user predictions
      const statsData = await fetchStats(activeFilter, selectedYear);
      if (cancelled) return;
      setSummary(statsData.summary);
      setPredictions(statsData.predictions);
      
      // Fetch dynamic league table standings
      const tableResult = await fetchLeagueTable(activeFilter, selectedYear);
      if (cancelled) return;

      // Get the logged-in user's favorite team straight from the backend,
      // instead of trusting a localStorage cache that's only set by ProfilePage.
      const token = localStorage.getItem("auth_token");
      const metaEnv = (import.meta as any).env;
      const baseUrl = metaEnv?.VITE_API_URL || "http://localhost:5001/api";

      let userFollowedTeam = "";
      try {
        const profileRes = await fetch(`${baseUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          userFollowedTeam = profileData.favoriteTeam || "";
        }
      } catch (err) {
        console.error("Failed to load favorite team:", err);
      }

      // Map through the backend results and dynamically mark the followed team as highlighted
      const updatedTableData = (tableResult || []).map((team: LeagueTeam) => {
        // If the user hasn't selected a team yet, don't highlight anything
        if (!userFollowedTeam) {
          return { ...team, highlighted: false };
        }

        // Clean up names for a match (e.g. "Chelsea FC" matches "Chelsea")
        const teamNameLower = team.name.toLowerCase();
        const userTeamLower = userFollowedTeam.toLowerCase();

        return {
          ...team,
          highlighted: 
            teamNameLower === userTeamLower || 
            teamNameLower.includes(userTeamLower) || 
            userTeamLower.includes(teamNameLower)
        };
      });

      setTableData(updatedTableData);

    } catch (err) {
      if (cancelled) return;
      console.error("Failed to load data:", err);
      setError("Unable to load performance and standing data.");
      
      // 2. Ensure table is cleared on failure too
      setTableData([]); 
    } finally {
      if (!cancelled) {
        setLoading(false);
        setTableLoading(false);
      }
    }
  }

  load();
  return () => {
    cancelled = true;
  };
}, [activeFilter, selectedYear]);

  const filtered = useMemo(() => {
    return predictions.filter((p) => {
      if (activeTab === "correct") return p.result !== "wrong";
      if (activeTab === "wrong") return p.result === "wrong";
      return true;
    });
  }, [predictions, activeTab]);

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(160deg, #0d1117 0%, #0b0f0b 40%, #0d1117 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-primary" fill="currentColor" />
            <span
              className="text-[10px] tracking-widest text-primary uppercase font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {activeFilter} · Results & Stats
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-foreground uppercase leading-tight mb-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Performance <span className="text-primary">Dashboard</span>
          </h1>
          <p
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
          >
            Your predictions outcome graded against final standings.
          </p>
        </div>

        {/* Summary strip */}
        <div
          className="grid grid-cols-3 gap-px mb-10 overflow-hidden rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {[
            {
              label: "Points This GW",
              value: `+${summary.pointsThisGameweek}`,
              gradient: "linear-gradient(135deg, #39ff14 0%, #22c55e 100%)",
              textColor: "#030603",
            },
            {
              label: "Correct Scores",
              value: `${summary.correctScores} / ${summary.totalPredictions}`,
              gradient: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              textColor: "#e4ede4",
            },
            {
              label: "Season Accuracy",
              value: `${summary.seasonAccuracy}%`,
              gradient: "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.08) 100%)",
              textColor: "#fbbf24",
            },
          ].map(({ label, value, gradient, textColor }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-5 gap-1"
              style={{ background: gradient }}
            >
              <span
                className="text-2xl font-black"
                style={{ color: textColor, fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {loading ? "—" : value}
              </span>
              <span
                className="text-[9px] tracking-widest uppercase"
                style={{
                  color: textColor === "#030603" ? "rgba(3,6,3,0.6)" : "rgba(228,237,228,0.5)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Section 1: Prediction Cards ─────────────────────────────── */}
        <section className="mb-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <SectionLabel>Prediction Results</SectionLabel>

            {/* Combined filters toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Gameweek selectors */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {["All", "GW38", "GW37"].map((f) => (
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

                <select
                  value={activeFilter.match(/^GW\d+$/) && !["GW38", "GW37", "GW2", "GW1"].includes(activeFilter) ? activeFilter : ""}
                  onChange={(e) => e.target.value && setActiveFilter(e.target.value)}
                  className={`px-2 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-sm border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition-all ${
                    activeFilter.match(/^GW\d+$/) && !["GW38", "GW37", "GW2", "GW1"].includes(activeFilter)
                      ? "!bg-primary !text-primary-foreground"
                      : ""
                  }`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
                >
                  <option value="">···</option>
                  {Array.from({ length: 34 }, (_, i) => `GW${36 - i}`).map((gw) => (
                    <option key={gw} value={gw}>{gw}</option>
                  ))}
                </select>

                {["GW2", "GW1"].map((f) => (
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

                {/* Year Select */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-2 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-sm border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition-all"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
                >
                  {["2026", "2025", "2024"].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Filter tabs */}
              <div
                className="flex items-center gap-1 p-1 rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {(["all", "correct", "wrong"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 rounded-md text-[10px] font-semibold tracking-widest uppercase transition-all"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      background: activeTab === tab ? "rgba(57,255,20,0.15)" : "transparent",
                      color: activeTab === tab ? "#39ff14" : "#6b7d6b",
                      border: activeTab === tab ? "1px solid rgba(57,255,20,0.3)" : "1px solid transparent",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg font-mono uppercase animate-pulse">
              Loading prediction outcomes...
            </div>
          ) : error ? (
            <div className="py-20 text-center text-xs text-destructive border border-dashed border-border rounded-lg font-mono uppercase">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg font-mono uppercase">
              No predictions in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filtered.map((card) => (
                <PredictionOutcomeCard key={card.id} card={card} />
              ))}
            </div>
          )}

          {/* Legend */}
          <div
            className="mt-6 flex flex-wrap items-center gap-5 px-5 py-3.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="text-[9px] tracking-widest text-muted-foreground/50 uppercase mr-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Key
            </span>
            {[
              { gradient: "linear-gradient(135deg, #39ff14, #22c55e)", label: "+3 · Correct Score", textColor: "#030603" },
              { gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)", label: "+1 · Correct Outcome", textColor: "#1a0e00" },
              { gradient: "linear-gradient(135deg, #64748b, #475569)", label: "0 · Wrong Guess", textColor: "#e2e8f0" },
            ].map(({ gradient, label, textColor }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background: gradient }}
                >
                  <Star size={8} style={{ color: textColor }} fill={textColor} />
                </div>
                <span
                  className="text-[10px] text-muted-foreground tracking-wider"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: League Table ─────────────────────────────────── */}
        <section>
          <SectionLabel>EPL Table · {activeFilter}</SectionLabel>

          <div
            className="rounded-2xl overflow-hidden backdrop-blur-sm"
            style={{
              background: "rgba(18,21,18,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
            }}
          >
            {/* Table header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <span className="w-8 text-[9px] tracking-widest text-muted-foreground/50 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pos</span>
              <span className="flex-1 text-[9px] tracking-widest text-muted-foreground/50 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Club</span>
              <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                {["P", "W", "D", "L", "GD"].map((h) => (
                  <span key={h} className="w-7 text-center text-[9px] tracking-widest text-muted-foreground/50 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h}</span>
                ))}
              </div>
              <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase w-28 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Form</span>
              <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase w-10 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pts</span>
            </div>

            {/* Champions League zone bar */}
            <div
              className="px-4 py-1 flex items-center gap-2"
              style={{ background: "linear-gradient(90deg, rgba(57,255,20,0.08) 0%, transparent 100%)" }}
            >
              <div className="w-1 h-3 rounded-full bg-primary/60" />
              <span
                className="text-[9px] tracking-widest text-primary/60 uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Champions League
              </span>
            </div>

            {/* Rows */}
            {tableLoading ? (
              <div className="py-10 text-center text-xs text-muted-foreground animate-pulse font-mono">
                LOADING LIVE TABLE...
              </div>
            ) : tableData.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground font-mono">
                NO STANDINGS FOUND FOR THIS GAMEWEEK.
              </div>
            ) : (
              tableData.map((team, i) => (
                <div key={team._id || team.pos}>
                  {team.pos === 5 && (
                    <div className="flex items-center gap-2 px-2 py-1 my-1">
                      <div className="flex-1 h-px" style={{ background: "rgba(251,191,36,0.2)" }} />
                      <span
                        className="text-[9px] tracking-widest uppercase"
                        style={{ color: "rgba(251,191,36,0.5)", fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Europa League
                      </span>
                      <div className="flex-1 h-px" style={{ background: "rgba(251,191,36,0.2)" }} />
                    </div>
                  )}
                  <LeagueTableRow team={team} index={i} />
                </div>
              ))
            )}
            {/* Footer */}
            <div
              className="px-4 py-3 flex items-center justify-between border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
            >
              <div className="flex items-center gap-4">
                {[
                  { color: "linear-gradient(135deg, #34d399, #059669)", shadow: "0 0 8px rgba(52,211,153,0.5)", label: "Win" },
                  { color: "linear-gradient(135deg, #fcd34d, #d97706)", shadow: "0 0 8px rgba(252,211,77,0.4)", label: "Draw" },
                  { color: "linear-gradient(135deg, #f87171, #dc2626)", shadow: "0 0 8px rgba(248,113,113,0.4)", label: "Loss" },
                ].map(({ color, shadow, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full" style={{ background: color, boxShadow: shadow }} />
                    <span className="text-[9px] tracking-wider text-muted-foreground/60 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
                  </div>
                ))}
              </div>
              <span
                className="text-[9px] text-muted-foreground/40 tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Updated · {activeFilter}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}