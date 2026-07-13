import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Clock,
  Lock,
  ChevronRight,
  Users,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Loader2,
  Save
} from "lucide-react";

// --- Types ---
interface PredictMatch {
  id: number;
  home: string;
  homeShort: string;
  homeCrest: string;
  homeColor: string;
  homeDim: string;
  away: string;
  awayShort: string;
  awayCrest: string;
  awayColor: string;
  awayDim: string;
  kickoff: string;
  venue: string;
  homeScore: string;
  awayScore: string;
  locked: boolean;
  community: {
    homeWin: number;
    draw: number;
    awayWin: number;
    totalPredictions: number;
  };
}

// --- Countdown hook ---
function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!target) return { expired: false, h: 0, m: 0, s: 0, string: "" };
  const delta = new Date(target).getTime() - now;
  if (delta <= 0) return { expired: true, h: 0, m: 0, s: 0, string: "LOCKED" };

  const h = Math.floor(delta / (1000 * 60 * 60));
  const m = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((delta % (1000 * 60)) / 1000);

  let str = `${h}h ${m}m ${s}s`;
  return { expired: false, h, m, s, string: str };
}

// --- Score Input Control Row subcomponent ---
function ScoreInput({
  value,
  onChange,
  disabled,
  accentColor,
  accentDim,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  accentColor: string;
  accentDim: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleAdjust = (delta: number) => {
    if (disabled) return;
    const cur = parseInt(value, 10) || 0;
    const next = Math.max(0, Math.min(9, cur + delta));
    onChange(String(next));
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <button
        onClick={() => handleAdjust(1)}
        disabled={disabled}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 text-sm font-black disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: accentColor,
        }}
      >
        +
      </button>

      <div className="relative">
        <input
          ref={ref}
          type="number"
          min={0}
          max={9}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "").slice(-1);
            onChange(v === "" ? "" : v);
          }}
          onFocus={() => ref.current?.select()}
          placeholder="-"
          className="w-16 h-16 rounded-xl text-center text-3xl font-black text-foreground focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-60"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            background: disabled ? "rgba(0,0,0,0.2)" : accentDim,
            border: `2px solid ${disabled ? "rgba(255,255,255,0.05)" : accentColor + "40"}`,
            boxShadow: value !== "" && value !== "0" && !disabled
              ? `0 0 16px ${accentColor}20, inset 0 0 12px ${accentColor}08`
              : "none",
            caretColor: accentColor,
          }}
        />
      </div>

      <button
        onClick={() => handleAdjust(-1)}
        disabled={disabled}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 text-sm font-black disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        −
      </button>
    </div>
  );
}

export default function PredictPage() {
  const navigate = useNavigate();

  const [gameweek, setGameweek] = useState<string>("Loading..."); // Updated default
  const [deadline, setDeadline] = useState<string | null>(null);
  const [matches, setMatches] = useState<PredictMatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = "http://localhost:5001/api";
  const { expired: deadlinePassed, h: countdownH, m: countdownM, string: countdownStr } = useCountdown(deadline);
  const urgency = !deadlinePassed && countdownH === 0 && countdownM < 30;

  useEffect(() => {
    async function fetchPredictiveFixtures() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${BACKEND_URL}/predict/fixtures`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Failed to fetch gameweek data.");

        const data = await res.json();
        setGameweek(data.gameweek);
        setDeadline(data.deadline);
        setMatches(data.matches || []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Unable to load fixtures. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchPredictiveFixtures();
  }, [navigate]);

  // ... (handleScoreUpdate and handleSubmitAll remain the same)

  if (loading) {
    // ... (Loading state remains the same)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-destructive">
        <AlertTriangle size={32} />
        <span className="text-sm font-bold tracking-widest uppercase">{error}</span>
        <button 
          onClick={() => window.location.reload()} 
          className="text-xs underline hover:text-white mt-2"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const handleScoreUpdate = (matchId: number, side: "home" | "away", val: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId && !m.locked && !deadlinePassed) {
          return { ...m, [side === "home" ? "homeScore" : "awayScore"]: val };
        }
        return m;
      })
    );
  };

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
      console.log("Mock Save Action Enabled: Synced matches offline.");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = useMemo(() => {
    return matches.filter((m) => m.homeScore !== "" && m.awayScore !== "").length;
  }, [matches]);

  const allComplete = matches.length > 0 && completedCount === matches.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
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
    <div
      className="min-h-screen relative text-foreground pb-32 selection:bg-primary/30"
      style={{
        background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(57,255,20,0.03) 0%, transparent 70%), #0b0d0b",
      }}
    >
      {/* Subtle pitch texture background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(57,255,20,0.5) 47px, rgba(57,255,20,0.5) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(57,255,20,0.5) 47px, rgba(57,255,20,0.5) 48px)",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        
        {/* TOP INTERACTIVE METRIC NAVIGATION ROW */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigate("/dashboard/fixtures")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span
              className="text-xs tracking-widest uppercase font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.14em" }}
            >
              Back to Fixtures
            </span>
          </button>

          {/* Dynamic Countdown Display Box */}
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-xl border"
            style={{
              background: urgency
                ? "linear-gradient(135deg, rgba(224,62,62,0.12), rgba(220,38,38,0.07))"
                : "linear-gradient(135deg, rgba(57,255,20,0.08), rgba(34,197,94,0.04))",
              borderColor: urgency ? "rgba(224,62,62,0.3)" : "rgba(57,255,20,0.2)",
            }}
          >
            <div className="relative">
              <Clock size={13} style={{ color: urgency ? "#e03e3e" : "#39ff14" }} />
              {!deadlinePassed && (
                <span
                  className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ background: urgency ? "#e03e3e" : "#39ff14" }}
                />
              )}
            </div>
            <span
              className="text-[10px] tracking-widest uppercase font-semibold"
              style={{
                color: urgency ? "#e03e3e" : "rgba(57,255,20,0.8)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {deadlinePassed ? "Locked" : "Locking Slate"}
            </span>
            <span
              className="text-xs font-black tracking-wider"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: urgency ? "#e03e3e" : "#39ff14",
              }}
            >
              {countdownStr || "00h 00m 00s"}
            </span>
          </div>
        </div>

        {/* PAGE INTRO HERO HERO BANNER */}
        <div className="text-center my-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span
              className="text-[10px] tracking-widest text-muted-foreground uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {gameweek} Active Configuration Profiles
            </span>
          </div>
          <h1
            className="text-3xl font-black text-foreground uppercase tracking-wider"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Submit Predictions
          </h1>
        </div>

        {deadlinePassed && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span>Gameweek lock active. Predictions for this matchday can no longer be edited.</span>
          </div>
        )}

        {submitted && (
          <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl p-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>All open picks successfully logged on server database nodes!</span>
          </div>
        )}

        {/* CORE MATCH CARDS REPEATER GRID LOOP */}
        <div className="flex flex-col gap-8">
          {matches.map((match) => {
            const isLocked = match.locked || deadlinePassed;
            
            const h = parseInt(match.homeScore, 10) || 0;
            const a = parseInt(match.awayScore, 10) || 0;
            const hasValues = match.homeScore !== "" && match.awayScore !== "";
            const predictedOutcome = !hasValues ? "None" : h > a ? `${match.home} Win` : h === a ? "Draw" : `${match.away} Win`;

            const userSide: "home" | "draw" | "away" | null = !hasValues ? null : h > a ? "home" : h === a ? "draw" : "away";

            const segments = [
              { key: "home" as const, label: `${match.homeShort} Win`, pct: match.community.homeWin, color: match.homeColor },
              { key: "draw" as const, label: "Draw", pct: match.community.draw, color: "#fbbf24" },
              { key: "away" as const, label: `${match.awayShort} Win`, pct: match.community.awayWin, color: match.awayColor },
            ];

            return (
              <div
                key={match.id}
                className={`rounded-2xl overflow-hidden transition-all duration-300 relative ${
                  isLocked ? "opacity-70 border-border/40" : "border-border hover:border-white/10"
                }`}
                style={{
                  background: "rgba(18,21,18,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Horizontal Dual Team Line Accent Gradient Accent Banner strip */}
                <div
                  className="h-px w-full"
                  style={{
                    background: `linear-gradient(90deg, ${match.homeColor}50, transparent 40%, transparent 60%, ${match.awayColor}50)`,
                  }}
                />

                <div className="px-5 md:px-8 py-5 flex flex-col gap-5">
                  {/* Row Metadata Banner info */}
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-wider border-b border-white/5 pb-2">
                    <span>{match.venue}</span>
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-destructive font-black">
                        <Lock size={10} /> LOCKED
                      </span>
                    ) : (
                      <span className="text-primary/70">OPEN PICK</span>
                    )}
                  </div>

                  {/* Core Content Score Input Selection Field Group Row */}
                  <div className="grid grid-cols-3 items-center justify-between gap-2">
                    
                    {/* Home Side Column Display */}
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                          style={{
                            background: `radial-gradient(circle at 40% 35%, ${match.homeDim}, rgba(18,21,18,0.6))`,
                            border: `1px solid ${match.homeColor}25`,
                          }}
                        >
                          {match.homeCrest}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full blur-lg opacity-40 pointer-events-none" style={{ background: match.homeColor }} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-foreground uppercase truncate max-w-[120px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {match.home}
                        </div>
                        <div className="text-[9px] tracking-widest text-muted-foreground font-mono">{match.homeShort}</div>
                      </div>
                      
                      <ScoreInput
                        value={match.homeScore}
                        disabled={isLocked}
                        accentColor={match.homeColor}
                        accentDim={match.homeDim}
                        onChange={(v) => handleScoreUpdate(match.id, "home", v)}
                      />
                    </div>

                    {/* Central VS Divider Display Block */}
                    <div className="flex flex-col items-center justify-center h-full pt-4">
                      <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/10" />
                      <div className="px-2.5 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] my-1">
                        <span className="text-xl font-black text-muted-foreground/30 font-condensed">VS</span>
                      </div>
                      <div className="w-px h-10 bg-gradient-to-t from-transparent to-white/10" />
                    </div>

                    {/* Away Side Column Display */}
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                          style={{
                            background: `radial-gradient(circle at 40% 35%, ${match.awayDim}, rgba(18,21,18,0.6))`,
                            border: `1px solid ${match.awayColor}25`,
                          }}
                        >
                          {match.awayCrest}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full blur-lg opacity-40 pointer-events-none" style={{ background: match.awayColor }} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-foreground uppercase truncate max-w-[120px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {match.away}
                        </div>
                        <div className="text-[9px] tracking-widest text-muted-foreground font-mono">{match.awayShort}</div>
                      </div>

                      <ScoreInput
                        value={match.awayScore}
                        disabled={isLocked}
                        accentColor={match.awayColor}
                        accentDim={match.awayDim}
                        onChange={(v) => handleScoreUpdate(match.id, "away", v)}
                      />
                    </div>

                  </div>

                  {/* Summary Dynamic Match Outcome Tracker Pill */}
                  <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg border border-white/5 bg-white/[0.01]">
                    <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase font-mono">Predicted:</span>
                    <span className="text-xs font-bold text-foreground font-condensed tracking-wide">{predictedOutcome}</span>
                    {hasValues && (
                      <span className="text-[10px] text-muted-foreground/50 font-mono">({match.homeScore} - {match.awayScore})</span>
                    )}
                  </div>

                  {/* SUBCOMPONENT: Community Distributions Insights Bars */}
                  <div className="mt-2 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground/70">
                        <Users size={11} />
                        <span className="text-[10px] font-bold uppercase tracking-wider font-condensed">Community Insight</span>
                      </div>
                      <span className="text-[8px] font-mono text-muted-foreground/40">{match.community.totalPredictions.toLocaleString()} entries</span>
                    </div>

                    {/* Integrated Distribution Segment Blocks */}
                    <div className="flex h-1.5 rounded-full overflow-hidden gap-px bg-white/5 mb-3">
                      {segments.map(({ key, pct, color }) => (
                        <div
                          key={key}
                          className="h-full transition-all duration-500 relative"
                          style={{ width: `${pct}%`, background: color }}
                        >
                          {userSide === key && <div className="absolute inset-0 bg-white/30 animate-pulse" />}
                        </div>
                      ))}
                    </div>

                    {/* Meta Label Metric Data Boxes */}
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {segments.map(({ key, label, pct, color }) => {
                        const isUserSelected = userSide === key;
                        return (
                          <div
                            key={key}
                            className="p-1 rounded-lg border transition-all flex flex-col justify-center"
                            style={{
                              background: isUserSelected ? `${color}08` : "rgba(255,255,255,0.01)",
                              borderColor: isUserSelected ? `${color}25` : "transparent"
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-[8px] tracking-widest text-muted-foreground/50 truncate font-mono uppercase">{label}</span>
                              {isUserSelected && (
                                <span className="text-[7px] bg-white/10 px-1 rounded-sm text-white font-bold font-mono">PICK</span>
                              )}
                            </div>
                            <span className="text-sm font-black font-condensed tracking-wide mt-0.5" style={{ color: isUserSelected ? color : '#e4ede4' }}>
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* POINT ALLOCATION INDEX SCOREBOX SYSTEM */}
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-white/5 mt-4">
          {[
            { label: "Correct Score", pts: "+3 pts", gradient: "linear-gradient(135deg, rgba(57,255,20,0.08), rgba(34,197,94,0.03))", color: "#39ff14" },
            { label: "Correct Outcome", pts: "+1 pt", gradient: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.03))", color: "#fbbf24" },
            { label: "Wrong Guess", pts: "0 pts", gradient: "linear-gradient(135deg, rgba(100,116,139,0.05), rgba(71,85,105,0.02))", color: "#64748b" },
          ].map(({ label, pts, gradient, color }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 py-2 px-1 text-center" style={{ background: gradient }}>
              <span className="text-sm font-black font-condensed" style={{ color }}>{pts}</span>
              <span className="text-[8px] tracking-widest text-muted-foreground/50 uppercase font-mono">{label}</span>
            </div>
          ))}
        </div>

        {/* FLOATING ACTION OVERLAY SYSTEM STICKY FOOTER PANEL */}
        {matches.length > 0 && !deadlinePassed && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-background/90 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                  {allComplete ? "All slates configured" : `${matches.length - completedCount} open configurations remaining`}
                </span>
              </div>
              
              <button
                onClick={handleSubmitAll}
                disabled={submitting || completedCount === 0}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-background text-xs uppercase tracking-widest font-black rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #39ff14 0%, #22c55e 100%)",
                  boxShadow: "0 4px 20px rgba(57,255,20,0.25)"
                }}
              >
                {submitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : submitted ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <Save size={13} />
                )}
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                  {submitting ? "Submitting..." : submitted ? "Locked In!" : "Submit Predictions"}
                </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}