// Read-only profile for another predictor, reached by clicking their name
// on the leaderboard. Rank/points/accuracy are always shown; the graded
// prediction history only renders if that user opted in (predictionsPublic).

/*---------Public Profile Page----------*/

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Check,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Lock,
  Loader2,
} from "lucide-react";

// --- Types matching server/routes/userRoutes.js's GET /:userId/public ---
type PredictionResult = "correct_score" | "correct_outcome" | "wrong";

interface PublicPrediction {
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
}

interface PublicProfile {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  favoriteTeam: string;
  memberSince: string;
  rank: number | string;
  points: number;
  accuracy: string;
  predictionsMade: number;
  correctScores: number;
  predictionsPublic: boolean;
  predictions: PublicPrediction[] | null;
}

const RESULT_CONFIG: Record<
  PredictionResult,
  { label: string; color: string; Icon: typeof CheckCircle2 }
> = {
  correct_score: { label: "Correct Score", color: "#39ff14", Icon: CheckCircle2 },
  correct_outcome: { label: "Correct Outcome", color: "#fbbf24", Icon: MinusCircle },
  wrong: { label: "No Points", color: "#64748b", Icon: XCircle },
};

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${BACKEND_URL}/user/${userId}/public`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Could not load that predictor's profile.");

        const data: PublicProfile = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchProfile();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span
          className="text-xs text-muted-foreground uppercase font-semibold tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Loading Predictor...
        </span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <button
          onClick={() => navigate("/dashboard/leaderboard")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors mb-6"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          <ArrowLeft size={12} />
          <span>Back to Leaderboard</span>
        </button>
        <div className="bg-card rounded-xl border border-border p-6 text-sm text-muted-foreground">
          {error || "Predictor not found."}
        </div>
      </div>
    );
  }

  const initials =
    (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "") || profile.username?.[0] || "U";

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      <button
        onClick={() => navigate("/dashboard/leaderboard")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors self-start"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        <ArrowLeft size={12} />
        <span>Back to Leaderboard</span>
      </button>

      {/* HEADER HERO ROW */}
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-lg font-black">
            {initials}
          </div>
          <div>
            <h1
              className="text-2xl font-black tracking-widest uppercase text-foreground"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {profile.firstName} {profile.lastName}
            </h1>
            <p
              className="text-xs font-mono text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              @{profile.username} · Member Since{" "}
              {profile.memberSince ? new Date(profile.memberSince).getFullYear() : "N/A"}
              {profile.favoriteTeam ? ` · ${profile.favoriteTeam}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Global Rank", val: profile.rank, icon: Trophy },
          { label: "Total Points", val: profile.points, icon: TrendingUp },
          { label: "Accuracy Matrix", val: profile.accuracy, icon: Target },
          {
            label: "Exact Scores",
            val: profile.correctScores,
            icon: Check,
            sub: `out of ${profile.predictionsMade} picks`,
          },
        ].map((block, idx) => (
          <div key={idx} className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-2">
              <span
                className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {block.label}
              </span>
              <block.icon size={14} className="text-primary/70 flex-shrink-0" />
            </div>
            <div className="mt-4">
              <span
                className="text-xl md:text-2xl font-black text-foreground tracking-tight"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {block.val}
              </span>
              {block.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{block.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* PREDICTION HISTORY — only if the user opted in */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <h2
            className="text-sm font-bold uppercase tracking-wider text-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Prediction History
          </h2>
        </div>

        {!profile.predictionsPublic ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 px-6 text-center">
            <Lock size={20} className="text-muted-foreground" />
            <p
              className="text-xs text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              This predictor's history is private
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Rank, points, and accuracy are still visible above — they just haven't made their
              match-by-match picks public.
            </p>
          </div>
        ) : !profile.predictions || profile.predictions.length === 0 ? (
          <div
            className="py-14 text-center text-xs text-muted-foreground uppercase tracking-widest"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            No graded predictions yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {profile.predictions.map((p) => {
              const cfg = RESULT_CONFIG[p.result];
              const Icon = cfg.Icon;
              const formattedDate = new Date(p.matchDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              });
              return (
                <div key={p.id} className="flex items-center gap-3 px-6 py-3.5">
                  <Icon size={14} style={{ color: cfg.color }} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold text-foreground truncate"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {p.homeTeam} <span className="text-muted-foreground">{p.finalHome}-{p.finalAway}</span> {p.awayTeam}
                    </p>
                    <p
                      className="text-[10px] text-muted-foreground tracking-widest uppercase"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Predicted {p.predHome}-{p.predAway} · {formattedDate}
                    </p>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-sm tracking-widest uppercase flex-shrink-0"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: cfg.color,
                      background: `${cfg.color}22`,
                    }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    className="w-10 text-right text-sm font-bold text-foreground flex-shrink-0"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    +{p.points}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
