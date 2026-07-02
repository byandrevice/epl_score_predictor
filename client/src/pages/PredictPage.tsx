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

// --- Countdown helper ---
function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!target) return { expired: false, string: "" };
  const delta = new Date(target).getTime() - now;
  if (delta <= 0) return { expired: true, string: "LOCKED" };

  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((delta % (1000 * 60)) / 1000);

  let str = "";
  if (days > 0) str += `${days}d `;
  if (hours > 0 || days > 0) str += `${hours}h `;
  str += `${mins}m ${secs}s`;

  return { expired: false, string: str };
}

export default function PredictPage() {
  const navigate = useNavigate();

  const [gameweek, setGameweek] = useState<string>("GW38");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [matches, setMatches] = useState<PredictMatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = "http://localhost:5001/api";

  const { expired: deadlinePassed, string: countdownStr } = useCountdown(deadline);

  // --- 1. Fetch upcoming gameweek prediction fixtures ---
  useEffect(() => {
    async function fetchPredictiveFixtures() {
      setLoading(true);
      setError(null);
      setSubmitted(false);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${BACKEND_URL}/predict/fixtures`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to pull gameweek submission profiles.");

        const data = await res.json();
        setGameweek(data.gameweek || "GW38");
        setDeadline(data.deadline || null);
        setMatches(data.matches || []);
      } catch (err: any) {
        
        /*******************************************************************************
         * 🚨 ATTENTION DEVELOPER: DELETE THIS ENTIRE BLOCK WHEN THE API IS READY 🚨
         * * PURPOSE:
         * This 'catch' block acts as a front-end safety net. Since your backend API team 
         * hasn't started the live server yet, your fetch calls will naturally fail. 
         * Instead of locking you out with a "Network Connection Error" screen, this block 
         * intercepts the error and populates your UI layout fields with high-fidelity, 
         * hardcoded mockup prediction fields.
         * * WHEN TO DELETE:
         * Remove this entire fallback catch block as soon as your local API server is online 
         * and successfully serving JSON payloads from:
         * - GET /api/predict/fixtures
         * * PRODUCTION STATUS: UNFIT FOR DEPLOYMENT (LOCAL TESTING ONLY)
         ******************************************************************************/
        
        console.warn("Backend offline, utilizing development mockup arrays.");

        setGameweek("GW38");
        
        // Simulates a deadline set 2 hours in the future to test the ticking clock countdown state
        const targetDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        setDeadline(targetDeadline);

        setMatches([
          {
            id: 101,
            home: "Arsenal",
            homeCrest: "🔴",
            away: "Manchester City",
            awayCrest: "🩵",
            kickoff: targetDeadline,
            venue: "Emirates Stadium",
            homeScore: "",
            awayScore: "",
            locked: false
          },
          {
            id: 102,
            home: "Chelsea",
            homeCrest: "🔵",
            away: "Liverpool",
            awayCrest: "🔺",
            kickoff: targetDeadline,
            venue: "Stamford Bridge",
            homeScore: "2",
            awayScore: "2",
            locked: false
          },
          {
            id: 103,
            home: "Manchester United",
            homeCrest: "😈",
            away: "Tottenham Hotspur",
            awayCrest: "🐓",
            kickoff: new Date(Date.now() - 60000).toISOString(), // Already locked match simulation
            venue: "Old Trafford",
            homeScore: "1",
            awayScore: "0",
            locked: true
          }
        ]);

        /*******************************************************************************
         * END OF DEVMOCK INTERCEPTOR BLOCK
         ******************************************************************************/

      } finally {
        setLoading(false);
      }
    }

    fetchPredictiveFixtures();
  }, [navigate]);

  // --- 2. Update a single input square score text ---
  const handleScoreChange = (matchId: number, side: "home" | "away", val: string) => {
    const numeric = val.replace(/\D/g, ""); // Keep numbers only
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId && !m.locked && !deadlinePassed) {
          return { ...m, [side === "home" ? "homeScore" : "awayScore"]: numeric };
        }
        return m;
      })
    );
  };

  // --- 3. Global Submit Routine ---
  const handleSubmitAll = async () => {
    if (deadlinePassed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const predictionsPayload = matches
        .filter((m) => !m.locked && m.homeScore !== "" && m.awayScore !== "")
        .map((m) => ({
          matchId: m.id,
          homeScore: parseInt(m.homeScore, 10),
          awayScore: parseInt(m.awayScore, 10),
        }));

      const res = await fetch(`${BACKEND_URL}/predict/submit-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ predictions: predictionsPayload }),
      });

      if (!res.ok) throw new Error("Server rejected batch prediction packet.");
      setSubmitted(true);
    } catch (err: any) {
      // Simulation saving fallback for offline dev environment
      console.log("Mock Save Action: Locked in upcoming matches!");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Count matches that have numbers written into both fields
  const completedCount = useMemo(() => {
    return matches.filter((m) => m.homeScore !== "" && m.awayScore !== "").length;
  }, [matches]);

  const allComplete = matches.length > 0 && completedCount === matches.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span
          className="text-xs text-muted-foreground uppercase font-semibold tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Synchronizing Gameweek Matrix...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-28">
      {/* HEADER HERO BAR */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h1
              className="text-2xl font-black tracking-widest uppercase text-foreground"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Submit Predictions
            </h1>
          </div>
          <p
            className="text-xs font-mono text-primary uppercase tracking-widest ml-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {gameweek} Slate Configuration
          </p>
        </div>

        {/* Dynamic Countdown Timer Widget */}
        <div className="flex items-center gap-3 bg-background border border-border px-4 py-2.5 rounded-lg min-w-[180px]">
          <Clock size={16} className={deadlinePassed ? "text-destructive" : "text-primary"} />
          <div className="flex flex-col">
            <span
              className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Lockdown Countdown
            </span>
            <span
              className={`text-sm font-black uppercase tracking-wider mt-0.5 ${
                deadlinePassed ? "text-destructive animate-pulse" : "text-foreground"
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {countdownStr || "00m 00s"}
            </span>
          </div>
        </div>
      </div>

      {deadlinePassed && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center gap-3 mb-6 text-xs font-semibold uppercase tracking-wider">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>Gameweek lockout active. Predictions for this matchday can no longer be edited.</span>
        </div>
      )}

      {submitted && (
        <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl p-4 flex items-center gap-3 mb-6 text-xs font-semibold uppercase tracking-wider">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>All open picks successfully logged on server database nodes!</span>
        </div>
      )}

      {/* MATCH PICK SELECTION CONTAINER ROWS */}
      <div className="flex flex-col gap-4">
        {matches.map((match) => {
          const isLocked = match.locked || deadlinePassed;
          return (
            <div
              key={match.id}
              className={`bg-card rounded-xl border p-5 transition-all relative overflow-hidden ${
                isLocked ? "border-border/40 opacity-75" : "border-border hover:border-border/80"
              }`}
            >
              {/* Info top banner row */}
              <div
                className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold mb-4 tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span>{match.venue}</span>
                {isLocked && (
                  <span className="flex items-center gap-1 text-destructive font-black">
                    <Lock size={10} /> LOCK
                  </span>
                )}
              </div>

              {/* Input grid core layout row */}
              <div className="grid grid-cols-3 items-center text-center gap-4">
                {/* Home */}
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  <span className="text-2xl filter drop-shadow-sm">{match.homeCrest}</span>
                  <span className="text-sm font-bold text-foreground truncate max-w-full">{match.home}</span>
                </div>

                {/* Score Input Box Block */}
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    disabled={isLocked}
                    value={match.homeScore}
                    onChange={(e) => handleScoreChange(match.id, "home", e.target.value)}
                    placeholder="-"
                    className={`w-12 h-12 text-center text-base font-black rounded-lg border outline-none transition-all ${
                      isLocked
                        ? "bg-muted/30 border-border/40 text-muted-foreground cursor-not-allowed"
                        : "bg-muted/60 border-border focus:border-primary text-foreground"
                    }`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <span className="text-xs font-black text-muted-foreground/50">V</span>
                  <input
                    type="text"
                    maxLength={2}
                    disabled={isLocked}
                    value={match.awayScore}
                    onChange={(e) => handleScoreChange(match.id, "away", e.target.value)}
                    placeholder="-"
                    className={`w-12 h-12 text-center text-base font-black rounded-lg border outline-none transition-all ${
                      isLocked
                        ? "bg-muted/30 border-border/40 text-muted-foreground cursor-not-allowed"
                        : "bg-muted/60 border-border focus:border-primary text-foreground"
                    }`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  <span className="text-2xl filter drop-shadow-sm">{match.awayCrest}</span>
                  <span className="text-sm font-bold text-foreground truncate max-w-full">{match.away}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STICKY BOTTOM SUBMIT OVERLAY CONSOLE PANEL */}
      {matches.length > 0 && !deadlinePassed && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <span
                className="text-xs text-muted-foreground uppercase tracking-widest font-bold"
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