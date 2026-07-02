// Where users enter score guesses

/*---------Predict Page----------*/

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router";
import {
  Clock,
  Lock,
  Loader2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";

// --- Types ---
interface PredictMatch {
  id: number;
  home: string;
  homeCrest: string;
  away: string;
  awayCrest: string;
  kickoff: string; // ISO timestamp
  venue: string;
  homeScore: string;
  awayScore: string;
  locked: boolean;
}

interface GameweekPayload {
  gameweek: string;
  deadline: string; // ISO timestamp
  matches: Omit<PredictMatch, "homeScore" | "awayScore" | "locked">[] extends never
    ? never
    : {
        id: number;
        home: string;
        homeCrest: string;
        away: string;
        awayCrest: string;
        kickoff: string;
        venue: string;
        predictedHomeScore?: string | number;
        predictedAwayScore?: string | number;
      }[];
}

// --- Countdown helper ---
function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!target) return { expired: false, label: "—" };

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return { expired: true, label: "Deadline Passed" };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const label =
    days > 0
      ? `${days}d ${hours}h ${mins}m`
      : `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return { expired: false, label };
}

export default function PredictPage() {
  const navigate = useNavigate();

  const [gameweek, setGameweek] = useState<string>("");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [matches, setMatches] = useState<PredictMatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const BACKEND_URL = "http://localhost:5001/api";
  const countdown = useCountdown(deadline);

  // --- 1. Load the active gameweek's fixtures ---
  useEffect(() => {
    async function fetchGameweek() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${BACKEND_URL}/predictions/current`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load this gameweek's fixtures.");

        const data: GameweekPayload = await res.json();

        setGameweek(data.gameweek);
        setDeadline(data.deadline);
        setMatches(
          data.matches.map((m) => ({
            id: m.id,
            home: m.home,
            homeCrest: m.homeCrest,
            away: m.away,
            awayCrest: m.awayCrest,
            kickoff: m.kickoff,
            venue: m.venue,
            homeScore: m.predictedHomeScore != null ? String(m.predictedHomeScore) : "",
            awayScore: m.predictedAwayScore != null ? String(m.predictedAwayScore) : "",
            locked: new Date(m.kickoff).getTime() <= Date.now(),
          }))
        );
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchGameweek();
  }, [navigate]);

  // --- 2. Score input handling ---
  const updateScore = (matchId: number, side: "homeScore" | "awayScore", value: string) => {
    const numeric = value.replace(/\D/g, "").slice(0, 2);
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [side]: numeric } : m))
    );
  };

  const completedCount = useMemo(
    () => matches.filter((m) => m.homeScore !== "" && m.awayScore !== "").length,
    [matches]
  );
  const allComplete = matches.length > 0 && completedCount === matches.length;

  // --- 3. Submit every filled-in prediction in one request ---
  const handleSubmitAll = async () => {
    const ready = matches.filter((m) => !m.locked && m.homeScore !== "" && m.awayScore !== "");
    if (ready.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const payload = {
        gameweek,
        predictions: ready.map((m) => ({
          fixtureId: m.id,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
        })),
      };

      const res = await fetch(`${BACKEND_URL}/predictions/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Could not submit predictions.");

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setError(err.message || "Could not submit predictions.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Loading / Error Guard Screens ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span
          className="text-xs text-muted-foreground uppercase font-semibold tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Loading Gameweek Fixtures...
        </span>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <p className="text-sm font-bold text-destructive">Network Connection Error</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-sm uppercase tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-28">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h1
              className="text-2xl font-black tracking-widest uppercase text-foreground"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Predict {gameweek}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground ml-4">
            {completedCount} / {matches.length} fixtures predicted
          </p>
        </div>

        {/* Deadline countdown */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-sm border ${
            countdown.expired ? "border-destructive/40 bg-destructive/10" : "border-primary/30 bg-primary/5"
          }`}
        >
          <Clock size={13} className={countdown.expired ? "text-destructive" : "text-primary"} />
          <span
            className={`text-xs font-bold tracking-widest uppercase ${
              countdown.expired ? "text-destructive" : "text-primary"
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {countdown.expired ? "Deadline Passed" : countdown.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${matches.length ? (completedCount / matches.length) * 100 : 0}%` }}
        />
      </div>

      {error && matches.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 border border-destructive/40 bg-destructive/10 rounded-sm">
          <AlertTriangle size={13} className="text-destructive flex-shrink-0" />
          <span className="text-xs text-destructive" style={{ fontFamily: "'DM Sans', sans-serif" }}>{error}</span>
        </div>
      )}

      {/* MATCH PREDICTION CARDS */}
      <div className="flex flex-col gap-3">
        {matches.map((match) => {
          const kickoffDate = new Date(match.kickoff);
          const dateLabel = kickoffDate.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
          const timeLabel = kickoffDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
          const filled = match.homeScore !== "" && match.awayScore !== "";

          return (
            <div
              key={match.id}
              className={`bg-card rounded-xl border p-4 transition-colors ${
                match.locked ? "border-border opacity-60" : filled ? "border-primary/30" : "border-border"
              }`}
            >
              <div
                className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold mb-3 tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <div className="flex gap-2">
                  <span>{dateLabel}</span>
                  <span className="text-primary">{timeLabel}</span>
                </div>
                <span className="truncate max-w-[140px]">{match.venue}</span>
              </div>

              <div className="grid grid-cols-3 items-center text-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">{match.homeCrest}</span>
                  <span className="text-sm font-bold truncate max-w-[110px]">{match.home}</span>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  {match.locked ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Lock size={12} />
                      <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        Locked
                      </span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-10 h-10 bg-muted/50 border border-border rounded-md text-center text-sm font-bold outline-none focus:border-primary"
                        value={match.homeScore}
                        placeholder="-"
                        onChange={(e) => updateScore(match.id, "homeScore", e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground font-black">V</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-10 h-10 bg-muted/50 border border-border rounded-md text-center text-sm font-bold outline-none focus:border-primary"
                        value={match.awayScore}
                        placeholder="-"
                        onChange={(e) => updateScore(match.id, "awayScore", e.target.value)}
                      />
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">{match.awayCrest}</span>
                  <span className="text-sm font-bold truncate max-w-[110px]">{match.away}</span>
                </div>
              </div>

              {filled && !match.locked && (
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-border/50">
                  <CheckCircle2 size={11} className="text-primary" />
                  <span
                    className="text-[10px] text-primary uppercase tracking-widest"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Ready to submit
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div className="py-16 text-center text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          No fixtures open for predictions right now.
        </div>
      )}

      {/* STICKY SUBMIT BAR */}
      {matches.length > 0 && !countdown.expired && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <span
                className="text-xs text-muted-foreground uppercase tracking-widest"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {allComplete ? "All fixtures predicted" : `${matches.length - completedCount} fixtures remaining`}
              </span>
            </div>
            <button
              onClick={handleSubmitAll}
              disabled={submitting || completedCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : submitted ? (
                <CheckCircle2 size={13} />
              ) : (
                <Save size={13} />
              )}
              <span>{submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit Predictions"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}