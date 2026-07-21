// Showing player rankings

/*---------Leaderboard Page----------*/

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router";
import {
  Trophy,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Crown,
  ChevronDown,
  Globe,
  AlertTriangle,
} from "lucide-react";

// --- Types ---
interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  pts: number;
  accuracy: string;
  trend: "up" | "down" | "same";
  isCurrentUser?: boolean;
  predictionsPublic?: boolean;
}

type ScopeFilter = "Overall" | "GW38" | "Friends";

const PAGE_SIZE = 25;

function TrendIcon({ trend }: { trend: LeaderboardUser["trend"] }) {
  if (trend === "up") return <TrendingUp size={12} className="text-primary" />;
  if (trend === "down") return <TrendingDown size={12} className="text-destructive" />;
  return <Minus size={12} className="text-muted-foreground" />;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const colors = {
      1: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.4)", text: "#fbbf24" },
      2: { bg: "rgba(203,213,225,0.15)", border: "rgba(203,213,225,0.35)", text: "#cbd5e1" },
      3: { bg: "rgba(217,119,6,0.15)", border: "rgba(217,119,6,0.4)", text: "#d97706" },
    }[rank as 1 | 2 | 3];
    return (
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
      >
        <Crown size={12} style={{ color: colors.text }} fill={colors.text} />
      </div>
    );
  }
  return (
    <span
      className="w-7 text-center text-xs font-bold text-muted-foreground flex-shrink-0"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();

  const [scope, setScope] = useState<ScopeFilter>("Overall");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api";

  // --- 1. Fetch leaderboard for the selected scope ---
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      setVisibleCount(PAGE_SIZE);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${BACKEND_URL}/leaderboard?scope=${scope}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load the leaderboard.");

        const data: { users: LeaderboardUser[]; currentUser: LeaderboardUser } = await res.json();

        setUsers(data.users);
        setCurrentUser(data.currentUser ?? null);
      } catch (err: any) {
        setError(err.message || "Failed to load the leaderboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [scope, navigate]);

  // --- 2. Client-side name search ---
  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Is the current user already inside the rendered list?
  const currentUserVisible = currentUser
    ? visible.some((u) => u.userId === currentUser.userId)
    : true;

  // --- Loading Guard Screens ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span
          className="text-xs text-muted-foreground uppercase font-semibold tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Loading Leaderboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-destructive">
        <AlertTriangle size={32} />
        <span className="text-xs font-bold tracking-widest uppercase">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h1
            className="text-2xl font-black tracking-widest uppercase text-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Leaderboard
          </h1>
        </div>

        {/* Scope filter tabs */}
        <div className="flex items-center gap-1.5">
          {(["Overall", "GW38", "Friends"] as ScopeFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase rounded-sm transition-all ${
                scope === s ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground border border-border"
              }`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search predictors..."
          className="w-full bg-muted border border-border pl-10 pr-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground/50 rounded-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div
          className="flex items-center gap-3 px-5 py-3 border-b border-border"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="w-7 text-[9px] tracking-widest text-muted-foreground/60 uppercase">Rank</span>
          <span className="flex-1 text-[9px] tracking-widest text-muted-foreground/60 uppercase">Predictor</span>
          <span className="w-14 text-center text-[9px] tracking-widest text-muted-foreground/60 uppercase hidden sm:block">Acc.</span>
          <span className="w-6 text-center text-[9px] tracking-widest text-muted-foreground/60 uppercase">Trd</span>
          <span className="w-16 text-right text-[9px] tracking-widest text-muted-foreground/60 uppercase">Pts</span>
        </div>

        {visible.length === 0 ? (
          <div
            className="py-14 text-center text-xs text-muted-foreground uppercase tracking-widest"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            No predictors found.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((user) => {
              const isMe = currentUser?.userId === user.userId;
              return (
                <div
                  key={user.userId}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(isMe ? "/dashboard/profile" : `/dashboard/user/${user.userId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(isMe ? "/dashboard/profile" : `/dashboard/user/${user.userId}`);
                    }
                  }}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer ${
                    isMe ? "bg-primary/5" : "hover:bg-muted/20"
                  }`}
                >
                  <RankBadge rank={user.rank} />
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span
                      className={`text-sm font-semibold truncate ${isMe ? "text-primary" : "text-foreground"}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {user.name}
                    </span>
                    {isMe && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-sm bg-primary/15 text-primary tracking-widest uppercase flex-shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        You
                      </span>
                    )}
                    {!isMe && user.predictionsPublic && (
                      <span
                        title="This predictor's history is public"
                        className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-sm bg-muted/60 text-muted-foreground tracking-widest uppercase flex-shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <Globe size={9} />
                        <span className="hidden sm:inline">Public</span>
                      </span>
                    )}
                  </div>
                  <span
                    className="w-14 text-center text-xs text-muted-foreground hidden sm:block"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {user.accuracy}
                  </span>
                  <span className="w-6 flex justify-center">
                    <TrendIcon trend={user.trend} />
                  </span>
                  <span
                    className={`w-16 text-right text-sm font-bold ${isMe ? "text-primary" : "text-foreground"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {user.pts.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="w-full flex items-center justify-center gap-1.5 py-3.5 border-t border-border text-xs text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <span>Show More</span>
            <ChevronDown size={12} />
          </button>
        )}
      </div>

      {/* STICKY "YOUR RANK" BAR — only shown when the user has scrolled past their own row */}
      {currentUser && !currentUserVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/30 bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-3">
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/dashboard/profile")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/dashboard/profile");
              }}
              className="flex items-center gap-3 px-5 py-3 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer"
            >
              <Trophy size={13} className="text-primary flex-shrink-0" />
              <RankBadge rank={currentUser.rank} />
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-primary truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {currentUser.name}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-sm bg-primary/15 text-primary tracking-widest uppercase flex-shrink-0"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  You
                </span>
              </div>
              <span className="w-14 text-center text-xs text-muted-foreground hidden sm:block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {currentUser.accuracy}
              </span>
              <span className="w-6 flex justify-center">
                <TrendIcon trend={currentUser.trend} />
              </span>
              <span className="w-16 text-right text-sm font-bold text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {currentUser.pts.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}