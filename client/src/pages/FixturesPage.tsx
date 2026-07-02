import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router";
import { Clock, MapPin, Trophy, ChevronRight, Filter, Calendar } from "lucide-react";

const FIXTURES = [
  {
    id: 1,
    home: "Arsenal",
    homeShort: "ARS",
    homeCrest: "🔴",
    homeColor: "#EF0107",
    away: "Chelsea",
    awayShort: "CHE",
    awayCrest: "🔵",
    awayColor: "#034694",
    date: "Sat 5 Jul 2025",
    time: "12:30",
    venue: "Emirates Stadium",
    competition: "Premier League",
    week: "GW38",
    status: "upcoming",
    predicted: false,
  },
  {
    id: 2,
    home: "Liverpool",
    homeShort: "LIV",
    homeCrest: "🔴",
    homeColor: "#C8102E",
    away: "Man City",
    awayShort: "MCI",
    awayCrest: "🔵",
    awayColor: "#6CABDD",
    date: "Sat 5 Jul 2025",
    time: "15:00",
    venue: "Anfield",
    competition: "Premier League",
    week: "GW38",
    status: "upcoming",
    predicted: true,
  },
  {
    id: 3,
    home: "Tottenham",
    homeShort: "TOT",
    homeCrest: "⚪",
    homeColor: "#132257",
    away: "Man Utd",
    awayShort: "MUN",
    awayCrest: "🔴",
    awayColor: "#DA291C",
    date: "Sun 6 Jul 2025",
    time: "16:30",
    venue: "Tottenham Hotspur Stadium",
    competition: "Premier League",
    week: "GW38",
    status: "upcoming",
    predicted: false,
  },
  {
    id: 4,
    home: "Aston Villa",
    homeShort: "AVL",
    homeCrest: "🟣",
    homeColor: "#670E36",
    away: "Newcastle",
    awayShort: "NEW",
    awayCrest: "⚫",
    awayColor: "#241F20",
    date: "Sun 6 Jul 2025",
    time: "14:00",
    venue: "Villa Park",
    competition: "Premier League",
    week: "GW38",
    status: "upcoming",
    predicted: false,
  },
  {
    id: 5,
    home: "Brighton",
    homeShort: "BHA",
    homeCrest: "🔵",
    homeColor: "#0057B8",
    away: "Fulham",
    awayShort: "FUL",
    awayCrest: "⚪",
    awayColor: "#000000",
    date: "Sat 5 Jul 2025",
    time: "15:00",
    venue: "Amex Stadium",
    competition: "Premier League",
    week: "GW38",
    status: "upcoming",
    predicted: true,
  },
  {
    id: 6,
    home: "Everton",
    homeShort: "EVE",
    homeCrest: "🔵",
    homeColor: "#003399",
    away: "Wolves",
    awayShort: "WOL",
    awayCrest: "🟡",
    awayColor: "#FDB913",
    date: "Mon 7 Jul 2025",
    time: "20:00",
    venue: "Goodison Park",
    competition: "Premier League",
    week: "GW38",
    status: "upcoming",
    predicted: false,
  },
];

const LEADERBOARD = [
  { rank: 1, name: "xavi_prophet", pts: 3842, accuracy: "71%", trend: "up" },
  { rank: 2, name: "gunner_oracle", pts: 3710, accuracy: "68%", trend: "up" },
  { rank: 3, name: "redzone_jamie", pts: 3588, accuracy: "66%", trend: "down" },
  { rank: 4, name: "pitch_vision", pts: 3401, accuracy: "64%", trend: "same" },
  { rank: 5, name: "klopp_disciple", pts: 3290, accuracy: "63%", trend: "up" },
];

const FILTERS = ["All", "GW38", "GW37", "GW36"];

function TeamCrest({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-2xl flex-shrink-0">
        {emoji}
      </div>
      <span
        className="text-sm font-bold text-foreground text-center leading-tight line-clamp-1"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}
      >
        {name}
      </span>
    </div>
  );
}

function FixtureCard({ fixture }: { fixture: typeof FIXTURES[0] }) {
  const navigate = useNavigate();

  return (
    <div className={`bg-card rounded-xl border transition-all duration-200 hover:shadow-lg group overflow-hidden ${fixture.predicted ? "border-primary/25 hover:border-primary/40" : "border-border hover:border-border/80"}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-muted/20 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-muted-foreground flex-shrink-0" />
            <span
              className="text-[10px] tracking-widest text-muted-foreground uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {fixture.date}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] tracking-widest font-semibold text-primary uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {fixture.time} BST
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] tracking-widest text-muted-foreground uppercase bg-muted/50 px-2 py-0.5 rounded-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {fixture.week}
          </span>
          {fixture.predicted && (
            <span
              className="text-[10px] tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Predicted ✓
            </span>
          )}
        </div>
      </div>

      {/* Match body */}
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Home team */}
        <div className="flex-1 flex justify-start">
          <TeamCrest emoji={fixture.homeCrest} name={fixture.home} />
        </div>

        {/* VS centre */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 px-2">
          <span
            className="text-xl font-black text-muted-foreground/30 leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            VS
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="text-[9px] tracking-widest text-muted-foreground/50 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {fixture.homeShort}
            </span>
            <span className="text-muted-foreground/30 text-[9px]">·</span>
            <span
              className="text-[9px] tracking-widest text-muted-foreground/50 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {fixture.awayShort}
            </span>
          </div>
        </div>

        {/* Away team */}
        <div className="flex-1 flex justify-end">
          <TeamCrest emoji={fixture.awayCrest} name={fixture.away} />
        </div>
      </div>

      {/* Venue + CTA */}
      <div className="px-5 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={10} className="text-muted-foreground flex-shrink-0" />
          <span
            className="text-[10px] text-muted-foreground tracking-wider truncate"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
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

function LeaderboardSidebar() {
  const navigate = useNavigate();

  const trendIcon = (trend: string) => {
    if (trend === "up") return <span className="text-primary text-[10px]">▲</span>;
    if (trend === "down") return <span className="text-destructive text-[10px]">▼</span>;
    return <span className="text-muted-foreground text-[10px]">—</span>;
  };

  return (
    <aside className="flex flex-col gap-5">
      {/* Leaderboard widget */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-primary" />
            <span
              className="text-sm font-bold tracking-widest uppercase text-foreground"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
            >
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

        {/* Table header */}
        <div className="px-5 py-2 flex items-center gap-3 border-b border-border bg-muted/20">
          <span className="w-6 text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#</span>
          <span className="flex-1 text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>User</span>
          <span className="w-10 text-right text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Acc</span>
          <span className="w-14 text-right text-[9px] tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pts</span>
        </div>

        <div className="divide-y divide-border">
          {LEADERBOARD.map((user) => (
            <div
              key={user.rank}
              className={`px-5 py-3 flex items-center gap-3 transition-colors hover:bg-muted/20 ${user.rank === 1 ? "bg-primary/5" : ""}`}
            >
              <div className="w-6 flex items-center gap-1">
                <span
                  className={`text-xs font-bold ${user.rank === 1 ? "text-primary" : "text-muted-foreground"}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {user.rank}
                </span>
              </div>
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-bold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span
                  className={`text-xs truncate ${user.rank === 1 ? "text-foreground font-semibold" : "text-foreground"}`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {user.name}
                </span>
                {trendIcon(user.trend)}
              </div>
              <span
                className="w-10 text-right text-[10px] text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {user.accuracy}
              </span>
              <span
                className={`w-14 text-right text-xs font-semibold ${user.rank === 1 ? "text-primary" : "text-foreground"}`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {user.pts.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Your position */}
        <div className="px-5 py-3 bg-muted/30 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-6">
              <span className="text-xs font-bold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>—</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>XP</span>
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>You · #2,104</span>
            </div>
            <span className="w-10 text-right text-[10px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>58%</span>
            <span className="w-14 text-right text-xs font-semibold text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>2,180</span>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <span
            className="text-sm font-bold tracking-widest uppercase text-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
          >
            Your GW38 Stats
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border">
          {[
            { label: "Predicted", value: "2 / 10", sub: "fixtures" },
            { label: "Points", value: "47", sub: "this week" },
            { label: "Accuracy", value: "58%", sub: "season avg" },
            { label: "Streak", value: "4W", sub: "correct row" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="px-4 py-4 flex flex-col gap-1">
              <span
                className="text-[10px] tracking-widest text-muted-foreground uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {label}
              </span>
              <span
                className="text-xl font-black text-foreground"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {value}
              </span>
              <span
                className="text-[10px] text-muted-foreground/60"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deadline countdown */}
      <div className="bg-secondary/60 rounded-xl border border-primary/15 px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span
            className="text-[10px] tracking-widest text-primary uppercase font-semibold"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Deadline
          </span>
        </div>
        <div
          className="text-2xl font-black text-foreground mb-1"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Fri 4 Jul · 19:45
        </div>
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
          Lock in your GW38 predictions before kickoff.
        </p>
      </div>
    </aside>
  );
}

export default function FixturesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main column */}
        <section>
          {/* Header */}
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
              <p
                className="text-xs text-muted-foreground ml-4 tracking-wider"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
              >
                {FIXTURES.length} matches · {FIXTURES.filter((f) => !f.predicted).length} unpredicted
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5">
              <Filter size={11} className="text-muted-foreground mr-1" />
              {FILTERS.map((f) => (
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

          {/* Date group */}
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={12} className="text-muted-foreground" />
            <span
              className="text-[10px] tracking-widest text-muted-foreground uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Gameweek 38 · Jul 5–7, 2025
            </span>
            <div className="flex-1 h-px bg-border" />
            <span
              className="text-[10px] tracking-widest text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {FIXTURES.filter((f) => f.predicted).length} / {FIXTURES.length} predicted
            </span>
          </div>

          {/* Fixture cards */}
          <div className="flex flex-col gap-3">
            {FIXTURES.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <LeaderboardSidebar />
      </div>
    </div>
  );
}
