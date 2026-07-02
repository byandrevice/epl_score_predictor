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

  // --- 1. Fetch user account profile configurations ---
  useEffect(() => {
    async function fetchProfileAndStats() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/");
          return;
        }

        const [profileRes, statsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/user/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok || !statsRes.ok) {
          throw new Error("Failed to sync personal credential vectors.");
        }

        const pData = await profileRes.json();
        const sData = await statsRes.json();

        setProfile(pData);
        setDraft(pData);
        setStats(sData);
      } catch (err: any) {
        
        /*******************************************************************************
         * 🚨 ATTENTION DEVELOPER: DELETE THIS ENTIRE BLOCK WHEN THE API IS READY 🚨
         * * PURPOSE:
         * This 'catch' block acts as a front-end safety net. Since your backend API team 
         * hasn't started the live server yet, your fetch calls will naturally fail. 
         * Instead of locking you out with a "Network Connection Error" screen, this block 
         * intercepts the error and populates your UI layout fields with high-fidelity, 
         * hardcoded mockup user profile stats and inputs.
         * * WHEN TO DELETE:
         * Remove this entire fallback catch block as soon as your local API server is online 
         * and successfully serving JSON payloads from:
         * - GET /api/user/profile
         * - GET /api/user/stats
         * * PRODUCTION STATUS: UNFIT FOR DEPLOYMENT (LOCAL TESTING ONLY)
         ******************************************************************************/
        
        console.warn("Backend offline, utilizing development mockup arrays.");

        const mockProfile: ProfileData = {
          username: "DevTester_Bypass",
          email: "developer@prempredict.io",
          firstName: "Dev",
          lastName: "Tester",
          favoriteTeam: "Arsenal",
          memberSince: "August 2025",
          emailNotifications: true,
          reminderNotifications: false
        };

        const mockStats: ProfileStats = {
          rank: "#4,120",
          points: 210,
          accuracy: "52%",
          correctScores: 14,
          predictionsMade: 38
        };

        setProfile(mockProfile);
        setDraft(mockProfile);
        setStats(mockStats);

        /*******************************************************************************
         * END OF DEVMOCK INTERCEPTOR BLOCK
         ******************************************************************************/

      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndStats();
  }, [navigate]);

  // --- 2. Post updated profile attributes ---
  const handleSaveProfile = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSaveConfirmed(false);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BACKEND_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });

      if (!res.ok) throw new Error("Could not commit settings adjustments.");

      const updated = await res.json();
      setProfile(updated);
      setDraft(updated);
      setEditing(false);
      setSaveConfirmed(true);
    } catch (err: any) {
      // Offline mode save fallback simulation
      setProfile(draft);
      setEditing(false);
      setSaveConfirmed(true);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: "emailNotifications" | "reminderNotifications") => {
    if (!draft) return;
    setDraft((prev) => (prev ? { ...prev, [key]: !prev[key] } : null));
    // Auto save layout for notification alterations
    setTimeout(() => {
      if (!editing) handleSaveProfile();
    }, 50);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span
          className="text-xs text-muted-foreground uppercase font-semibold tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Loading Profile Portfolio...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* HEADER HERO ROW */}
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-lg font-black">
            {profile?.firstName?.[0] || profile?.username?.[0] || "U"}
          </div>
          <div>
            <h1
              className="text-2xl font-black tracking-widest uppercase text-foreground"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {profile?.firstName} {profile?.lastName}
            </h1>
            <p
              className="text-xs font-mono text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              @{profile?.username} · Member Since {profile?.memberSince}
            </p>
          </div>
        </div>

        {/* Action button toggles */}
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
              onClick={() => {
                setDraft(profile);
                setEditing(false);
              }}
              className="flex items-center gap-1 px-3 py-2 border border-border text-muted-foreground text-xs uppercase tracking-widest font-bold rounded-sm hover:text-foreground transition-colors"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              <X size={12} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {saveConfirmed && (
        <div className="bg-primary/10 border border-primary/20 text-primary rounded-sm p-3.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Check size={14} />
          <span>Account changes committed successfully.</span>
        </div>
      )}

      {/* CORE STATS GRID HERO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Global Rank", val: stats?.rank, icon: Trophy },
          { label: "Total Points", val: stats?.points, icon: TrendingUp },
          { label: "Accuracy Matrix", val: stats?.accuracy, icon: Target },
          { label: "Exact Scores", val: stats?.correctScores, icon: Check, sub: `out of ${stats?.predictionsMade} picks` },
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

      {/* DETAILED FORM INPUT BLOCKS */}
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col gap-5">
        <h2
          className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border pb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Personal Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          {[
            { label: "First Name", key: "firstName", type: "text" },
            { label: "Last Name", key: "lastName", type: "text" },
            { label: "Username", key: "username", type: "text" },
            { label: "Email Address", key: "email", type: "email" },
          ].map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {field.label}
              </label>
              <input
                type={field.type}
                disabled={!editing}
                value={draft ? (draft as any)[field.key] : ""}
                onChange={(e) => setDraft((prev) => (prev ? { ...prev, [field.key]: e.target.value } : null))}
                className={`px-3.5 py-2.5 rounded-sm border text-sm outline-none transition-colors ${
                  !editing
                    ? "bg-muted/40 border-border/60 text-muted-foreground cursor-not-allowed"
                    : "bg-muted/80 border-border focus:border-primary/60 text-foreground"
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          ))}

          {/* Favorite Team Selector Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Supported Club
            </label>
            <select
              disabled={!editing}
              value={draft?.favoriteTeam || ""}
              onChange={(e) => setDraft((prev) => (prev ? { ...prev, favoriteTeam: e.target.value } : null))}
              className={`px-3.5 py-2.5 rounded-sm border text-sm outline-none transition-colors appearance-none ${
                !editing
                  ? "bg-muted/40 border-border/60 text-muted-foreground cursor-not-allowed"
                  : "bg-muted/80 border-border focus:border-primary/60 text-foreground"
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <option value="">Select a club...</option>
              {EPL_TEAMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* COMPACT NOTIFICATION PREFERENCES TOGGLE ROW */}
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Bell size={14} className="text-primary" />
          <h2
            className="text-sm font-bold uppercase tracking-wider text-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Notification Vectors
          </h2>
        </div>

        <div className="divide-y divide-border/60">
          {[
            {
              title: "Email Digests",
              desc: "Receive comprehensive point evaluations and gameweek summary insights.",
              key: "emailNotifications" as const,
            },
            {
              title: "Lockdown Reminders",
              desc: "Get urgent system alerts 1 hour prior to upcoming gameweek match closure gates.",
              key: "reminderNotifications" as const,
            },
          ].map(({ title, desc, key }) => (
            <div key={key} className="py-4 flex items-center justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {title}
                </p>
                <p
                  className="text-xs text-muted-foreground mt-0.5"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                >
                  {desc}
                </p>
              </div>

              {/* Toggle Switch Button */}
              <button
                type="button"
                onClick={() => handleToggle(key)}
                className={`relative inline-flex w-9 rounded-full transition-colors cursor-pointer p-0.5 outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                  draft?.[key] ? "bg-primary" : "bg-switch-background"
                }`}
                style={{ height: "1.375rem" }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
                    draft?.[key] ? "translate-x-4" : "translate-x-0"
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