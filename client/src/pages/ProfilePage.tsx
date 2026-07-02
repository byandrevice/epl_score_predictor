// User account details

/*---------Profile Page----------*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Bell,
  Save,
  LogOut,
  Loader2,
  Pencil,
  X,
  Check,
} from "lucide-react";

// --- Types ---
interface ProfileData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  favoriteTeam: string;
  memberSince: string;
  emailNotifications: boolean;
  reminderNotifications: boolean;
}

interface ProfileStats {
  rank: number | string;
  points: number;
  accuracy: string;
  correctScores: number;
  predictionsMade: number;
}

const EPL_TEAMS = [
  "Arsenal", "Aston Villa", "Chelsea", "Liverpool", "Manchester City",
  "Manchester United", "Newcastle United", "Tottenham Hotspur",
];

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [draft, setDraft] = useState<ProfileData | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  const BACKEND_URL = "http://localhost:5001/api";

  // --- 1. Fetch profile + stats on mount ---
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

        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, statsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/profile`, { headers }),
          fetch(`${BACKEND_URL}/user-stats`, { headers }),
        ]);

        if (!profileRes.ok || !statsRes.ok) {
          throw new Error("Failed to load account data.");
        }

        const profileData: ProfileData = await profileRes.json();
        const statsData: ProfileStats = await statsRes.json();

        setProfile(profileData);
        setDraft(profileData);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate]);

  // --- 2. Save profile changes ---
  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${BACKEND_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });

      if (!response.ok) throw new Error("Could not save profile changes.");

      setProfile(draft);
      setEditing(false);
      setSaveConfirmed(true);
      setTimeout(() => setSaveConfirmed(false), 2500);
    } catch (err: any) {
      setError(err.message || "Could not save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  const updateDraft = (field: keyof ProfileData, value: string | boolean) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // --- Loading / Error Guard Screens ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-xs text-muted-foreground uppercase font-semibold tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Loading Profile...
        </span>
      </div>
    );
  }

  if (error && !profile) {
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

  if (!profile || !draft || !stats) return null;

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h1
          className="text-2xl font-black tracking-widest uppercase text-foreground"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Your Profile
        </h1>
      </div>

      {/* IDENTITY CARD */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span
                className="text-xl font-black text-primary"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {initials}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {profile.firstName} {profile.lastName}
                </span>
              </div>
              <span
                className="text-xs text-muted-foreground tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                @{profile.username} · Member since {profile.memberSince}
              </span>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-border text-foreground text-xs uppercase tracking-widest font-bold rounded-sm hover:border-primary/40 transition-colors self-start sm:self-auto"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              <Pencil size={12} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground text-xs uppercase tracking-widest font-bold rounded-sm hover:text-foreground transition-colors"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <X size={12} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Save size={12} />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>

        {saveConfirmed && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-sm">
            <Check size={12} className="text-primary" />
            <span className="text-[10px] text-primary uppercase tracking-widest font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Profile updated successfully
            </span>
          </div>
        )}
        {error && profile && (
          <p className="mt-3 text-[10px] text-destructive tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {error}
          </p>
        )}
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Global Rank", value: `#${stats.rank}`, icon: Trophy },
          { label: "Total Points", value: stats.points.toLocaleString(), icon: TrendingUp },
          { label: "Accuracy", value: stats.accuracy, icon: Target },
          { label: "Predictions Made", value: stats.predictionsMade, icon: User },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border px-4 py-4 flex flex-col gap-2">
            <Icon size={14} className="text-primary" />
            <span className="text-xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {value}
            </span>
            <span
              className="text-[9px] text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ACCOUNT DETAILS */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <span
          className="text-sm font-bold tracking-widest uppercase text-foreground block mb-5"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Account Details
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              First Name
            </label>
            <input
              type="text"
              disabled={!editing}
              value={draft.firstName}
              onChange={(e) => updateDraft("firstName", e.target.value)}
              className="w-full bg-muted border border-border px-4 py-2.5 text-foreground text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Last Name
            </label>
            <input
              type="text"
              disabled={!editing}
              value={draft.lastName}
              onChange={(e) => updateDraft("lastName", e.target.value)}
              className="w-full bg-muted border border-border px-4 py-2.5 text-foreground text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Username
            </label>
            <input
              type="text"
              disabled={!editing}
              value={draft.username}
              onChange={(e) => updateDraft("username", e.target.value)}
              className="w-full bg-muted border border-border px-4 py-2.5 text-foreground text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Email Address
            </label>
            <input
              type="email"
              disabled={!editing}
              value={draft.email}
              onChange={(e) => updateDraft("email", e.target.value)}
              className="w-full bg-muted border border-border px-4 py-2.5 text-foreground text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Favorite Club
            </label>
            <select
              disabled={!editing}
              value={draft.favoriteTeam}
              onChange={(e) => updateDraft("favoriteTeam", e.target.value)}
              className="w-full bg-muted border border-border px-4 py-2.5 text-foreground text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {EPL_TEAMS.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PREFERENCES */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={14} className="text-primary" />
          <span
            className="text-sm font-bold tracking-widest uppercase text-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Notification Preferences
          </span>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {[
            {
              key: "emailNotifications" as const,
              title: "Email Notifications",
              desc: "Weekly digest of your results and leaderboard movement.",
            },
            {
              key: "reminderNotifications" as const,
              title: "Prediction Reminders",
              desc: "Get notified before the gameweek deadline closes.",
            },
          ].map(({ key, title, desc }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                  {desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => editing && updateDraft(key, !draft[key])}
                disabled={!editing}
                className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                  draft[key] ? "bg-primary" : "bg-switch-background"
                }`}
                style={{ height: "1.375rem" }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
                    draft[key] ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DANGER / SESSION ZONE */}
      <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Sign out of PremPredict
          </p>
          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            You'll need to log back in to make new predictions.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 border border-destructive/40 text-destructive text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-destructive/10 transition-colors"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          <LogOut size={12} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}