import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  MapPin,
  Shield,
  ChevronRight,
  TrendingUp,
  Crosshair,
  AlertTriangle,
  Star,
  Calendar,
  Users,
} from "lucide-react";

// Import API calls and types from your backend folder
import { teamApi } from "../api/index";

// ─── Types ─────────────────────────────────────────────────────────────────

type FormResult = "W" | "D" | "L";

interface Fixture {
  id: string;
  opponent: string;
  opponentCrest: string;
  opponentShort: string;
  date: string;
  time: string;
  venue: "H" | "A";
  competition: string;
}

interface Scorer {
  rank: number;
  name: string;
  initials: string;
  position: string;
  goals: number;
  assists: number;
}

// ─── Form badge ────────────────────────────────────────────────────────────

const FORM_CFG: Record<FormResult, { bg: string; glow: string; text: string }> = {
  W: { bg: "linear-gradient(135deg, #34d399 0%, #059669 100%)", glow: "0 4px 14px rgba(52,211,153,0.5)", text: "#fff" },
  D: { bg: "linear-gradient(135deg, #fcd34d 0%, #d97706 100%)", glow: "0 4px 14px rgba(252,211,77,0.45)", text: "#1a0e00" },
  L: { bg: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)", glow: "0 4px 14px rgba(248,113,113,0.5)", text: "#fff" },
};

function FormBadge({ result, large }: { result: FormResult; large?: boolean }) {
  const cfg = FORM_CFG[result];
  const size = large ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center font-black flex-shrink-0 transition-transform hover:scale-110`}
      style={{ background: cfg.bg, boxShadow: cfg.glow, color: cfg.text, fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      {result}
    </div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────

function SectionLabel({ children, primaryColor }: { children: React.ReactNode; primaryColor: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-5 rounded-full" style={{ background: primaryColor }} />
      <h2
        className="text-base font-black tracking-widest uppercase text-foreground"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
      >
        {children}
      </h2>
    </div>
  );
}

// ─── Glass card wrapper ────────────────────────────────────────────────────

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "rgba(18,21,18,0.78)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        backdropFilter: "blur(14px)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Upcoming fixture row ──────────────────────────────────────────────────

function FixtureRow({ fixture, primaryColor, primaryDim }: { fixture: Fixture; primaryColor: string; primaryDim: string }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 transition-colors group"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Venue pill */}
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0"
        style={{
          background: fixture.venue === "H" ? `${primaryDim}` : "rgba(255,255,255,0.05)",
          border: `1px solid ${fixture.venue === "H" ? primaryColor + "40" : "rgba(255,255,255,0.1)"}`,
          color: fixture.venue === "H" ? primaryColor : "#6b7d6b",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {fixture.venue}
      </div>

      {/* Opponent crest + name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 p-1"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {fixture.opponentCrest ? (
            <img src={fixture.opponentCrest} alt={fixture.opponent} className="w-full h-full object-contain filter drop-shadow-md" />
          ) : (
            "🛡️"
          )}
        </div>
        <div className="min-w-0">
          <div
            className="text-sm font-bold text-foreground truncate"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}
          >
            {fixture.venue === "H" ? "vs " : "@ "}{fixture.opponent}
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={9} className="text-muted-foreground/40" />
            <span
              className="text-[10px] tracking-widest text-muted-foreground/50"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {fixture.date} · {fixture.time}
            </span>
          </div>
        </div>
      </div>

      {/* Competition tag */}
      <span
        className="hidden sm:block text-[9px] tracking-widest text-muted-foreground/40 uppercase flex-shrink-0"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        PL
      </span>

      {/* Predict CTA */}
      <button
        onClick={() => navigate("/dashboard/predict")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "0.1em",
          background: "linear-gradient(135deg, #39ff14 0%, #22c55e 100%)",
          color: "#030603",
          boxShadow: "0 2px 12px rgba(57,255,20,0.3)",
        }}
      >
        Predict <ChevronRight size={10} />
      </button>
    </div>
  );
}

// ─── Top scorer row ────────────────────────────────────────────────────────

function ScorerRow({ scorer, primaryColor, primaryDim }: { scorer: Scorer; primaryColor: string; primaryDim: string }) {
  const isFirst = scorer.rank === 1;
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Rank */}
      <span
        className={`text-xs font-black w-5 text-center flex-shrink-0 ${isFirst ? "" : "text-muted-foreground/40"}`}
        style={{ fontFamily: "'JetBrains Mono', monospace", color: isFirst ? primaryColor : undefined }}
      >
        {scorer.rank}
      </span>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
        style={{
          background: isFirst ? primaryDim : "rgba(255,255,255,0.05)",
          border: `2px solid ${isFirst ? primaryColor + "50" : "rgba(255,255,255,0.08)"}`,
          color: isFirst ? primaryColor : "#6b7d6b",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        {scorer.initials}
      </div>

      {/* Name + position */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-semibold truncate ${isFirst ? "text-foreground" : "text-foreground/80"}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {scorer.name}
        </div>
        <span
          className="text-[9px] tracking-widest text-muted-foreground/40 uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {scorer.position}
        </span>
      </div>

      {/* Goals */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <span
          className={`text-base font-black leading-none ${isFirst ? "" : "text-foreground/70"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: isFirst ? primaryColor : undefined }}
        >
          {scorer.goals}
        </span>
        <span className="text-[8px] tracking-widest text-muted-foreground/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>G</span>
      </div>

      <div className="w-px h-6 bg-white/5 flex-shrink-0" />

      {/* Assists */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <span
          className="text-base font-black leading-none text-foreground/50"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {scorer.assists}
        </span>
        <span className="text-[8px] tracking-widest text-muted-foreground/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>A</span>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TeamPage() {
  console.log("TeamPage component has rendered!");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  // Keep an integrated single state object with safe default values 
  // so the layout never breaks while loading data from MongoDB
  const [teamProfile, setTeamProfile] = useState({
    clubData: {
      name: "Loading Club...",
      shortName: "...",
      logoUrl: "",
      stadium: "Stadium",
      capacity: "N/A",
      manager: "Manager",
      founded: 1886,
      rank: 0,
      rankSuffix: "th",
      played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: "0", pts: 0,
      primaryColor: "#22c55e",
      primaryDim: "rgba(34,197,94,0.12)",
      primaryGlow: "rgba(34,197,94,0.18)",
    },
    formHistory: [] as FormResult[],
    upcomingFixtures: [] as Fixture[],
    topScorers: [] as Scorer[],
    statsSummary: [] as any[]
  });

  useEffect(() => {
    async function fetchTeamProfile() {
      if (!id) {
        console.log("TeamPage: No ID found in URL parameters");
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        console.log("Fetching data for ID:", id); // Check if this logs
        
        const responseData = await teamApi.getTeamDetails(id.toUpperCase(), token);
        
        console.log("API Response Received:", responseData); // Check if this logs
        
        if (responseData) {
          setTeamProfile({
            clubData: {
              ...responseData.club, // This will pick up name, shortName, stadium, etc.
              primaryDim: `${responseData.club.primaryColor}1f`,
              primaryGlow: `${responseData.club.primaryColor}2d`,
              rankSuffix: responseData.club.rank === 1 ? "st" : responseData.club.rank === 2 ? "nd" : "rd"
            },
            formHistory: responseData.form || [],
            upcomingFixtures: responseData.upcoming || [],
            topScorers: responseData.scorers || [], // Matches the key in teamController
            statsSummary: responseData.stats || []  // Matches the key in teamController
          });
        }
      } catch (error) {
        // THIS IS THE IMPORTANT PART
        console.error("CRITICAL ERROR in fetchTeamProfile:", error); 
      } finally {
        setLoading(false);
        console.log("Loading state set to false");
      }
    }
  
    fetchTeamProfile();
  }, [id]);

  // Shortcut references to make the layout rendering code below happy
  const { clubData, formHistory, upcomingFixtures, topScorers, statsSummary } = teamProfile;

  const wdl = [clubData.won, clubData.drawn, clubData.lost];
  const total = wdl.reduce((s, v) => s + v, 0);

  // Fallback map icons dictionary for safe dynamic lookup
  const iconMap: Record<string, any> = {
    TrendingUp: TrendingUp,
    Shield: Shield,
    Crosshair: Crosshair,
  };

  return (
    <div className="min-h-full relative" style={{ background: "#0b0d0b" }}>
      {/* Simple Live Data Sync Pill Indicators */}
      {loading && (
        <div className="absolute top-4 right-4 z-50 bg-primary/10 border border-primary/30 px-3 py-1 text-[10px] uppercase font-mono tracking-widest text-primary animate-pulse">
          Syncing Live Data...
        </div>
      )}

      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 60% 100% at 15% 50%, ${clubData.primaryGlow}, transparent 65%),
            radial-gradient(ellipse 40% 80% at 85% 50%, rgba(239,1,7,0.06) 0%, transparent 60%),
            linear-gradient(180deg, rgba(18,21,18,0.85) 0%, rgba(11,13,11,1) 100%)
          `,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Faint pitch-line grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(239,1,7,0.8) 59px, rgba(239,1,7,0.8) 60px)",
          }}
        />

        {/* Large ghost crest watermark */}
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 w-40 h-40 select-none pointer-events-none opacity-10 flex items-center justify-center p-2"
        >
          {clubData.logoUrl && <img src={clubData.logoUrl} alt="" className="w-full h-full object-contain opacity-25 filter blur-[1px]" />}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

            {/* Crest */}
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center p-4"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${clubData.primaryDim}, rgba(14,16,14,0.9))`,
                  border: `2px solid ${clubData.primaryColor}35`,
                  boxShadow: `0 0 40px ${clubData.primaryColor}20, 0 8px 32px rgba(0,0,0,0.5)`,
                }}
              >
                {clubData.logoUrl ? (
                  <img src={clubData.logoUrl} alt={`${clubData.name} Crest`} className="w-full h-full object-contain filter drop-shadow-md" />
                ) : (
                  <Shield size={48} className="text-muted-foreground/30" />
                )}
              </div>
              {/* Glow beneath */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full blur-xl pointer-events-none"
                style={{ background: clubData.primaryColor, opacity: 0.25 }}
              />
            </div>

            {/* Identity */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {/* League badge */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: clubData.primaryColor }} />
                  <span
                    className="text-[10px] tracking-widest uppercase text-muted-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Premier League · 2026/27
                  </span>
                </div>
              </div>

              {/* Team name */}
              <h1
                className="text-5xl md:text-7xl font-black text-foreground uppercase leading-none"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}
              >
                {clubData.name.split(" ").map((word, i) => (
                  <span key={i}>
                    {i === 0 ? <span style={{ color: clubData.primaryColor }}>{word}</span> : ` ${word}`}
                  </span>
                ))}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-muted-foreground/50" />
                  <span
                    className="text-xs text-muted-foreground/60 tracking-wider"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {clubData.stadium} · {clubData.capacity}
                  </span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Users size={11} className="text-muted-foreground/50" />
                  <span
                    className="text-xs text-muted-foreground/60 tracking-wider"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Mgr: {clubData.manager}
                  </span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <span
                  className="text-xs text-muted-foreground/40 tracking-wider"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Est. {clubData.founded}
                </span>
              </div>

              {/* Rank + pts strip */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{
                    background: `${clubData.primaryDim}`,
                    border: `1px solid ${clubData.primaryColor}35`,
                    boxShadow: `0 0 20px ${clubData.primaryColor}12`,
                  }}
                >
                  <Star size={13} style={{ color: clubData.primaryColor }} fill={clubData.primaryColor} />
                  <span
                    className="text-sm font-black uppercase"
                    style={{ color: clubData.primaryColor, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
                  >
                    {clubData.rank}{clubData.rankSuffix} in EPL
                  </span>
                </div>

                {[
                  { label: "Pts", val: clubData.pts, accent: true },
                  { label: "GD", val: clubData.gd },
                  { label: "W", val: clubData.won },
                  { label: "D", val: clubData.drawn },
                  { label: "L", val: clubData.lost },
                ].map(({ label, val, accent }) => (
                  <div
                    key={label}
                    className="flex items-baseline gap-1 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <span
                      className="text-lg font-black leading-none"
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        color: accent ? clubData.primaryColor : "#e4ede4",
                      }}
                    >
                      {val}
                    </span>
                    <span
                      className="text-[9px] tracking-widest text-muted-foreground/40 uppercase"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── Main panel ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Form guide card */}
            <GlassCard>
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <SectionLabel primaryColor={clubData.primaryColor}>Recent Form</SectionLabel>
                <span
                  className="text-[10px] tracking-widest text-muted-foreground/40 uppercase -mt-5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Last 5 matches
                </span>
              </div>

              <div className="px-6 py-6 flex flex-col gap-6">
                {/* Badge row */}
                <div className="flex items-center gap-3">
                  {formHistory.map((r, i) => <FormBadge key={i} result={r} large />)}
                  <div className="ml-2 flex flex-col gap-0.5">
                    <span
                      className="text-2xl font-black text-foreground leading-none"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {formHistory.filter((f) => f === "W").length}W
                      <span className="text-muted-foreground/40 mx-1">·</span>
                      {formHistory.filter((f) => f === "D").length}D
                      <span className="text-muted-foreground/40 mx-1">·</span>
                      {formHistory.filter((f) => f === "L").length}L
                    </span>
                    <span
                      className="text-[10px] text-muted-foreground/40 tracking-wider"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      last 5 GWs
                    </span>
                  </div>
                </div>

                {/* W/D/L bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex h-2 rounded-full overflow-hidden gap-px">
                    <div style={{ width: `${total > 0 ? (clubData.won / total) * 100 : 0}%`, background: "linear-gradient(90deg, #34d399, #059669)" }} />
                    <div style={{ width: `${total > 0 ? (clubData.drawn / total) * 100 : 0}%`, background: "linear-gradient(90deg, #fcd34d, #d97706)" }} />
                    <div style={{ width: `${total > 0 ? (clubData.lost / total) * 100 : 0}%`, background: "linear-gradient(90deg, #f87171, #dc2626)" }} />
                  </div>
                  <div className="flex items-center gap-5">
                    {[
                      { label: "Win rate", val: `${total > 0 ? Math.round((clubData.won / total) * 100) : 0}%`, color: "#34d399" },
                      { label: "Draw rate", val: `${total > 0 ? Math.round((clubData.drawn / total) * 100) : 0}%`, color: "#fcd34d" },
                      { label: "Loss rate", val: `${total > 0 ? Math.round((clubData.lost / total) * 100) : 0}%`, color: "#f87171" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-[10px] text-muted-foreground/50" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {label}: <span className="text-foreground/70 font-semibold">{val}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Upcoming Fixtures card */}
            <GlassCard>
              <div
                className="px-6 pt-5 pb-0 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <SectionLabel primaryColor={clubData.primaryColor}>Upcoming Fixtures</SectionLabel>
              </div>
              <div>
                {upcomingFixtures.length > 0 ? (
                  upcomingFixtures.map((f) => (
                    <FixtureRow 
                      key={f.id} 
                      fixture={f} 
                      primaryColor={clubData.primaryColor} 
                      primaryDim={clubData.primaryDim} 
                    />
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                    No Scheduled Matches Found
                  </div>
                )}
              </div>
              <div
                className="px-6 py-3"
                style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span
                  className="text-[10px] tracking-widest text-muted-foreground/30 uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  H = Home · A = Away
                </span>
              </div>
            </GlassCard>

            {/* Season snapshot mini-grid */}
            <div
              className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {[
                { label: "Goals per Game", value: total > 0 ? (clubData.gf / total).toFixed(1) : "0.0" },
                { label: "Points per Game", value: total > 0 ? (clubData.pts / total).toFixed(1) : "0.0" },
                { label: "Conceded per Game", value: total > 0 ? (clubData.ga / total).toFixed(1) : "0.0" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center py-5 gap-1"
                  style={{ background: "rgba(18,21,18,0.85)" }}
                >
                  <span
                    className="text-3xl font-black"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", color: clubData.primaryColor }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-[9px] tracking-widest text-muted-foreground/50 uppercase text-center"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Top Scorers card */}
            <GlassCard>
              <div
                className="px-5 pt-5 pb-0 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <SectionLabel primaryColor={clubData.primaryColor}>Top Scorers</SectionLabel>
              </div>

              {/* Table header */}
              <div
                className="flex items-center gap-3 px-5 py-2"
                style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="w-5" />
                <span className="w-8" />
                <span className="flex-1 text-[9px] tracking-widest text-muted-foreground/40 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Player</span>
                <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase w-6 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>G</span>
                <div className="w-px" />
                <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase w-6 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>A</span>
              </div>

              <div>
                {topScorers.length > 0 ? (
                  topScorers.map((s) => (
                    <ScorerRow 
                      key={s.rank} 
                      scorer={s} 
                      primaryColor={clubData.primaryColor} 
                      primaryDim={clubData.primaryDim} 
                    />
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-xs text-muted-foreground/40 font-mono uppercase tracking-widest">
                    No Player Records Available
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Team stats card */}
            <GlassCard>
              <div
                className="px-5 pt-5 pb-0 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <SectionLabel primaryColor={clubData.primaryColor}>Team Stats</SectionLabel>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y" style={{ "--tw-divide-opacity": "0.06" } as React.CSSProperties}>
                {statsSummary.length > 0 ? (
                  statsSummary.map(({ label, value, icon, accent }) => {
                    const ComputedIcon = iconMap[icon] || AlertTriangle;
                    return (
                      <div key={label} className="flex flex-col gap-2 px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <ComputedIcon size={11} style={{ color: accent || clubData.primaryColor }} />
                          <span
                            className="text-[9px] tracking-widest text-muted-foreground/50 uppercase"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {label}
                          </span>
                        </div>
                        <span
                          className="text-3xl font-black leading-none"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: accent || clubData.primaryColor }}
                        >
                          {value}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-6 text-center text-xs text-muted-foreground/40 font-mono uppercase tracking-widest">
                    No Aggregate Metrics Loaded
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Predict CTA card */}
            <div
              className="rounded-2xl px-5 py-5 flex flex-col gap-3 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${clubData.primaryDim} 0%, rgba(14,16,14,0.9) 100%)`,
                border: `1px solid ${clubData.primaryColor}30`,
                boxShadow: `0 0 32px ${clubData.primaryColor}10`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${clubData.primaryColor}60, transparent)` }}
              />
              <div className="flex items-center gap-2">
                <Crosshair size={13} style={{ color: clubData.primaryColor }} />
                <span
                  className="text-xs font-black tracking-widest uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", color: clubData.primaryColor, letterSpacing: "0.12em" }}
                >
                  Predictions Live
                </span>
              </div>
              <p
                className="text-sm text-foreground/70 leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
              >
                Matchweek is live. Lock in your predictions before kickoff to gain points on the leaderboard!
              </p>
              <button
                onClick={() => navigate("/dashboard/predict")}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.14em",
                  background: "linear-gradient(135deg, #39ff14 0%, #22c55e 100%)",
                  color: "#030603",
                  boxShadow: "0 4px 20px rgba(57,255,20,0.3)",
                }}
              >
                Predict Matches <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}