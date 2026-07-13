import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, XCircle, MinusCircle, Star, Zap, ChevronRight } from "lucide-react";

// --- Types matching predictionController.getStats()'s response exactly ---
type PredictionResult = "correct_score" | "correct_outcome" | "wrong";

interface PredictionCard {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string;
  awayCrest: string;
  finalHome: number;
  finalAway: number;
  predHome: number;
  predAway: number;
  result: PredictionResult;
  points: number;
  matchDate: string;
  venue: string;
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

type Tab = "all" | "correct" | "wrong";

const RESULT_CONFIG: Record<
  PredictionResult,
  { label: string; icon: typeof CheckCircle2; textClass: string; bgClass: string; borderClass: string }
> = {
  correct_score: {
    label: "Perfect Score",
    icon: CheckCircle2,
    textClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/30",
  },
  correct_outcome: {
    label: "Correct Result",
    icon: MinusCircle,
    textClass: "text-amber-400",
    bgClass: "bg-amber-400/10",
    borderClass: "border-amber-400/25",
  },
  wrong: {
    label: "Incorrect",
    icon: XCircle,
    textClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/20",
  },
};

// Same base-URL + auth pattern as dashboardApi.ts's fetchSecure, kept local
// here so this page has no dependency beyond localStorage's auth_token.
async function fetchStats(): Promise<StatsResponse> {
  const metaEnv = (import.meta as any).env;
  const baseUrl = metaEnv?.VITE_API_URL || "http://localhost:5001/api";
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`${baseUrl}/predictions/stats`, {
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

export default function StatsGallery() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
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
      try {
        const data = await fetchStats();
        if (cancelled) return;
        setSummary(data.summary);
        setPredictions(data.predictions);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load prediction stats:", err);
        setError("Unable to load performance data.");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return predictions.filter((p) => {
      if (activeTab === "correct") return p.result !== "wrong";
      if (activeTab === "wrong") return p.result === "wrong";
      return true;
    });
  }, [predictions, activeTab]);

  if (loading) {
    return (
      <main className="min-h-screen pt-14 bg-background flex items-center justify-center">
        <span
          className="text-xs tracking-widest uppercase text-muted-foreground animate-pulse"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Loading Dashboard...
        </span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-14 bg-background flex items-center justify-center">
        <span
          className="text-xs tracking-widest uppercase text-destructive"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {error}
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-14 bg-background">
      {/* Hero header, matching the striped-grid treatment used on the landing page */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(57,255,20,0.5) 39px, rgba(57,255,20,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(57,255,20,0.5) 39px, rgba(57,255,20,0.5) 40px)`,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-14 pb-10">
          <h1
            className="text-4xl md:text-5xl font-black text-foreground uppercase leading-none tracking-tight mb-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Performance <span className="text-primary">Dashboard</span>
          </h1>
          <p
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
          >
            Every prediction you've made this season, graded against the final score.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-px mb-10 overflow-hidden rounded-lg border border-border bg-border">
          <SummaryCell
            icon={<Zap size={14} className="text-primary" />}
            value={`+${summary.pointsThisGameweek}`}
            label="Points This GW"
          />
          <SummaryCell
            value={`${summary.correctScores} / ${summary.totalPredictions}`}
            label="Correct Scores"
          />
          <SummaryCell value={`${summary.seasonAccuracy}%`} label="Season Accuracy" />
        </div>

        {/* Prediction Cards */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 bg-primary" />
            <h2
              className="text-xl font-bold tracking-widest uppercase text-foreground"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
            >
              Prediction Results
            </h2>
          </div>

          <div className="flex gap-2 mb-6">
            {(["all", "correct", "wrong"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs uppercase tracking-wider border rounded-md transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}
              >
                {tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg font-mono uppercase">
              No predictions in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filtered.map((card) => (
                <PredictionOutcomeCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function SummaryCell({
  icon,
  value,
  label,
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-5 gap-1 bg-card">
      {icon}
      <span
        className="text-2xl font-black text-foreground"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {value}
      </span>
      <span
        className="text-[9px] uppercase text-muted-foreground tracking-wider"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </span>
    </div>
  );
}

function PredictionOutcomeCard({ card }: { card: PredictionCard }) {
  const config = RESULT_CONFIG[card.result];
  const Icon = config.icon;
  const date = new Date(card.matchDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className={`relative bg-card border ${config.borderClass} rounded-lg p-4 flex flex-col gap-3.5`}>
      {card.result === "correct_score" && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
          <Star size={11} className="text-primary-foreground" fill="currentColor" />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-foreground truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {card.homeCrest} {card.homeTeam}
        </span>
        <span
          className="text-[9px] text-muted-foreground uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          vs
        </span>
        <span
          className="text-xs text-foreground truncate text-right"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {card.awayTeam} {card.awayCrest}
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 py-2 border-y border-border">
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-xl font-black text-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {card.finalHome}-{card.finalAway}
          </span>
          <span
            className="text-[9px] uppercase text-muted-foreground tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Final
          </span>
        </div>
        <span className="text-muted-foreground/40">/</span>
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-xl font-black text-muted-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {card.predHome}-{card.predAway}
          </span>
          <span
            className="text-[9px] uppercase text-muted-foreground tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Your Pick
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 text-[10px] uppercase px-2 py-1 rounded ${config.bgClass} ${config.textClass}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <Icon size={11} />
          {config.label}
        </span>
        <span
          className="text-xs font-bold text-muted-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          +{card.points} pts
        </span>
      </div>

      <div
        className="flex items-center justify-between text-[9px] text-muted-foreground/70"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <span>{date}</span>
        <span className="truncate max-w-[60%] text-right">{card.venue}</span>
      </div>
    </div>
  );
}