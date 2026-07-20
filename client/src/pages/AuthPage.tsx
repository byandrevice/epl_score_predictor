import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import { Eye, EyeOff, Trophy, ChevronRight, Clock, Zap } from "lucide-react";

// Import API calls and types from our backend folder
import { authApi, Match, LeaderboardUser } from "../api/index";

// Define the 4 views/screens a user can see on this page
type Screen = "landing" | "login" | "register" | "verify";

/**
 * NavBar Component:
 * The top navigation bar that stays fixed at the top of the screen.
 * Shows login/signup buttons on the landing page, or a "Back" button on auth pages.
 */
function NavBar({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  // Show the back button only on login, register, or verification screens
  const showBack = screen === "login" || screen === "register" || screen === "verify";
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14 border-b border-border bg-background/90 backdrop-blur-sm">
      {/*--- App Logo ---*/}
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-primary" fill="currentColor" />
        <span
          className="text-sm font-semibold tracking-widest uppercase text-foreground"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em" }}
        >
          PremPredict
        </span>
      </div>

      {/* Buttons to show if we are on the home/landing page */}
      {screen === "landing" && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen("login")}
            className="text-xs tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Log In
          </button>
          <button
            onClick={() => setScreen("register")}
            className="px-4 py-1.5 text-xs tracking-widest uppercase bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Back button to show if we are inside login/register/verify */}
      {showBack && (
        <button
          onClick={() => setScreen("landing")}
          className="text-xs tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          ← Back
        </button>
      )}
    </header>
  );
}

/**
 * MatchCard Component:
 * Displays a single football match fixture with home/away teams, game info, and betting-style odds buttons.
 */
function MatchCard({ match }: { match: Match }) {
  return (
    <div className="bg-card border border-border p-6 flex items-center justify-between gap-3 group hover:border-primary/30 transition-colors duration-200">
      
      {/* Home Team */}
      <div className="flex flex-col items-center gap-2 flex-1">
        {/* Replace match.homeCrest with the actual logo URL */}
        <img 
          src={match.homeLogoUrl} 
          alt={match.home} 
          className="w-12 h-12 object-contain" 
        />
        <span className="text-sm font-bold text-foreground text-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {match.home}
        </span>
      </div>

      {/* Away Team */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <img 
          src={match.awayLogoUrl} 
          alt={match.away} 
          className="w-12 h-12 object-contain" 
        />
        <span className="text-sm font-bold text-foreground text-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {match.away}
        </span>
      </div>
      
    </div>
  );
}

/**
 * LeaderboardWidget Component:
 * Shows a preview list of the top 5 players globally to encourage guests to sign up.
 */
function LeaderboardWidget({ leaderboard, setScreen }: { leaderboard: LeaderboardUser[]; setScreen: (s: Screen) => void }) {
  if (!Array.isArray(leaderboard)) {
    return <div className="text-foreground/80 text-xs">No leaderboard data available.</div>;
  }
  return (
    <div className="bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-primary" />
          <span className="text-xs font-bold tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em" }}>Global Top 5</span>
        </div>
        <button onClick={() => setScreen("register")} className="flex items-center gap-1 text-[10px] tracking-widest text-primary uppercase hover:opacity-80 transition-opacity" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Join <ChevronRight size={10} />
        </button>
      </div>

      {/* List of top users */}
      <div className="divide-y divide-border">
        {leaderboard.map((user) => (
          <div key={user.rank} className="px-5 py-2.5 flex items-center gap-3">
            <span className={`text-xs font-bold w-5 text-center flex-shrink-0 ${user.rank === 1 ? "text-primary" : "text-foreground/80"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {user.rank === 1 ? "01" : `0${user.rank}`}
            </span>
            <span className="flex-1 text-sm text-foreground font-medium tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>{user.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-foreground/70 tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.accuracy}</span>
              <span className={`text-xs font-semibold ${user.rank === 1 ? "text-primary" : "text-foreground"}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.pts.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA footer link */}
      <div className="px-5 py-3 bg-muted/20 border-t border-border">
        <button onClick={() => setScreen("register")} className="w-full text-[10px] tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors text-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Sign up to claim your spot
        </button>
      </div>
    </div>
  );
}

/**
 * LandingScreen Component:
 * The main homepage presentation filled with marketing text, active live games, and leaderboard previews.
 */
function LandingScreen({ matches, leaderboard, setScreen }: { matches: Match[]; leaderboard: LeaderboardUser[]; setScreen: (s: Screen) => void }) {
  return (
    <main className="min-h-screen pt-14 bg-background">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(57,255,20,0.5) 39px, rgba(57,255,20,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(57,255,20,0.5) 39px, rgba(57,255,20,0.5) 40px)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0b0d0b)" }} />
        <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 border border-primary/30 bg-primary/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] tracking-widest text-primary uppercase font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>2024/25 Season · GW38 Predictions Open</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-foreground leading-none tracking-tight uppercase mb-6 max-w-3xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Predict the <span className="text-primary">Premier</span><br />
            League. <span className="relative inline-block" style={{ WebkitTextStroke: "1px rgba(57,255,20,0.4)", color: "transparent" }}>Claim</span> the<br />Leaderboard.
          </h1>
          <p className="text-base md:text-lg text-foreground/80 max-w-md mb-10 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            Predict every EPL fixture. Earn points for accuracy. Rise through the global ranks. Weekly prizes for the sharpest football minds.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setScreen("register")} className="group flex items-center gap-3 px-7 py-3.5 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-all active:scale-[0.98]" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em" }}>
              Sign Up Now <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => setScreen("login")} className="px-7 py-3.5 border border-border text-foreground font-bold tracking-widest uppercase text-sm hover:border-primary/40 transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em" }}>
              Log In
            </button>

          </div>
          <div className="mt-10 flex items-center gap-6 flex-wrap">
            {[["48K+", "Active Predictors"], ["£10K", "Monthly Prize Pool"], ["380", "Fixtures / Season"]].map(([num, label]) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{num}</span>
                <span className="text-xs text-foreground/80 tracking-wider uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section: Fixtures & Leaderboard preview grids */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 py-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary" />
            <h2 className="text-xl font-bold tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Upcoming Fixtures</h2>
          </div>
          <span className="text-[10px] tracking-widest text-foreground/80 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>GW38 · Live Feed</span>
        </div>
        
        {/* Loading state or match cards mapping */}
        {matches.length === 0 ? (
          <div className="py-10 text-center text-xs text-foreground/80 animate-pulse font-mono uppercase">Syncing Live Fixtures...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {matches.slice(0, 3).map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}

        {/* Lower layout split: Leaderboard + Description Promo box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-primary" />
              <h2 className="text-xl font-bold tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Leaderboard</h2>
            </div>
            <LeaderboardWidget leaderboard={leaderboard} setScreen={setScreen} />
          </div>
          <div className="md:col-span-2 flex flex-col justify-between bg-card border border-border p-6 md:p-8">
            <div>
              <div className="text-4xl md:text-5xl font-black text-foreground uppercase leading-tight mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Every Goal.<br /><span className="text-primary">Every Point.</span><br />Your Reputation.
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed max-w-sm" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                Make predictions before kickoff, score points based on accuracy — exact scores, correct outcomes, goal margins. Track your position in real-time against the world.
              </p>
            </div>
            <button onClick={() => setScreen("register")} className="mt-8 self-start flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em" }}>
              Start Predicting <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer copyright info */}
      <footer className="border-t border-border px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-primary" fill="currentColor" />
          <span className="text-xs tracking-widest text-foreground/80 uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>PremPredict © 2025</span>
        </div>
        <span className="text-[10px] text-foreground/80 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Not affiliated with the Premier League</span>
      </footer>
    </main>
  );
}

/**
 * AuthField Component:
 * Reusable input element for our forms. Features a custom label and optional password view toggling.
 */
function AuthField({ label, type, placeholder, value, onChange, showToggle }: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; showToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  // Switch between password or standard text input based on visibility state
  const inputType = showToggle ? (visible ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-widest uppercase text-foreground/80 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</label>
      <div className="relative">
        <input type={inputType} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-muted border border-border px-4 py-3 text-foreground text-sm placeholder:text-foreground/80/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
          style={{ fontFamily: "'DM Sans', sans-serif" }} />
        {/* Toggle hide/show icon for password fields */}
        {showToggle && (
          <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-foreground transition-colors">
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * LoginScreen Component:
 * Form view that authenticates existing user credentials.
 */
function LoginScreen({ leaderboard, setScreen }: { leaderboard: LeaderboardUser[]; setScreen: (s: Screen) => void }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const topUser = leaderboard[0];

  // Submit credentials to backend API login endpoint
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const data = await authApi.login({ identity: emailOrUsername, password });

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      navigate("/dashboard"); // Redirect user to dashboard
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login connection context failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-14 bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary" />
            <span className="text-2xl font-black tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Welcome Back</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>Log in to your account and get back to predicting.</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <AuthField 
            label="Email or Username" 
            type="text" 
            placeholder="you@example.com or username" 
            value={emailOrUsername} 
            onChange={setEmailOrUsername} 
          />
          <AuthField 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={setPassword} 
            showToggle 
          />
          {error && <span className="text-[10px] text-destructive font-mono uppercase tracking-wider">{error}</span>}
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-primary hover:opacity-80 transition-opacity"
            >
              Forgot Password?
            </button>
          </div>
          <button type="submit" disabled={loading} className="mt-2 w-full py-3.5 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity active:scale-[0.99] disabled:opacity-50">
            {loading ? "Verifying..." : "Log In"}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-border text-center">
          <span className="text-sm text-foreground/80" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>No account yet? </span>
          <button onClick={() => setScreen("register")} className="text-sm text-primary hover:opacity-80 transition-opacity font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>Sign up for free</button>
        </div>
        
        {/* Shows current global rank #1 user info if available */}
        {topUser && (
          <div className="mt-6 p-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={11} className="text-primary" />
              <span className="text-[10px] tracking-widest text-primary uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Current leader</span>
            </div>
            <div className="text-sm text-foreground font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {topUser.name} <span className="text-foreground/80 font-normal">· {topUser.pts.toLocaleString()} pts · {topUser.accuracy} accuracy</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * RegisterScreen Component:
 * Form view that sets up account creation details for a new profile context.
 */
function RegisterScreen({ setScreen, onRegister }: { setScreen: (s: Screen) => void; onRegister: (email: string) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Simple validation checking if the typed password matches the confirmation string
  const passwordMatch = confirm === "" || password === confirm;

  // Handles clicking the form submit registration trigger
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreed || !passwordMatch || password === "" || email === "" || username === "" || firstName === "" || lastName === "") return;

    setLoading(true);
    try {
      await authApi.register({ firstName, lastName, username, email, password });

      onRegister(email);  // Save target email for verification step
      setScreen("verify");  // Move onwards to verify setup stage
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not register new member session profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-14 bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary" />
            <span className="text-2xl font-black tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Create Account</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>Join 48,000+ predictors competing for leaderboard glory this season.</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-3">
            <AuthField label="First Name" type="text" placeholder="John" value={firstName} onChange={setFirstName} />
            <AuthField label="Last Name" type="text" placeholder="Doe" value={lastName} onChange={setLastName} />
          </div>
          <AuthField label="Username" type="text" placeholder="john_doe" value={username} onChange={setUsername} />
          <AuthField label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
          <AuthField label="Password" type="password" placeholder="min. 8 characters" value={password} onChange={setPassword} showToggle />
          
          {/* Unique explicit confirm password field matching state layout check */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest uppercase text-foreground/80 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Confirm Password</label>
            <div className="relative">
              <input type="password" placeholder="repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className={`w-full bg-muted border px-4 py-3 text-foreground text-sm placeholder:text-foreground/80/50 focus:outline-none transition-all ${!passwordMatch ? "border-destructive focus:border-destructive" : confirm !== "" && password === confirm ? "border-primary/50 focus:border-primary/60 focus:ring-1 focus:ring-primary/20" : "border-border focus:border-primary/60 focus:ring-1 focus:ring-primary/20"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }} />
              {confirm !== "" && password === confirm && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs">✓</span>}
            </div>
            {!passwordMatch && <span className="text-[10px] text-destructive tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Passwords do not match</span>}
          </div>
          {error && <span className="text-[10px] text-destructive font-mono uppercase tracking-wider">{error}</span>}
          <div className="mt-1 flex flex-col gap-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                className="sr-only" // Hides the native checkbox visually but keeps it accessible
              />
              <div className="w-3.5 h-3.5 mt-0.5 border border-border flex-shrink-0 flex items-center justify-center bg-muted text-[10px] font-bold text-primary transition-colors">
                {agreed && "X"} {/* 👈 The X appears here when agreed is true! */}
              </div>
              <span className="text-xs text-foreground/80 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                I agree to the <span className="text-primary hover:opacity-80">Terms of Service</span> and <span className="text-primary hover:opacity-80">Privacy Policy</span>
              </span>
            </label>
          </div>
          <button 
            type="submit" 
            disabled={!agreed || !passwordMatch || password === "" || email === "" || username === "" || firstName === "" || lastName === "" || loading}
            className="mt-2 w-full py-3.5 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em" }}
          >
            {loading ? "Creating Profile..." : "Create Account"}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-border text-center">
          <span className="text-sm text-foreground/80" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>Already have an account? </span>
          <button onClick={() => setScreen("login")} className="text-sm text-primary hover:opacity-80 transition-opacity font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>Log in</button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-px bg-border">
          {[["Free", "Forever"], ["Live", "Updates"], ["Global", "Rankings"]].map(([top, bot]) => (
            <div key={top} className="bg-card px-3 py-3 text-center">
              <div className="text-sm font-bold text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{top}</div>
              <div className="text-[10px] text-foreground/80 tracking-wider uppercase mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{bot}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


/**
 * VerifyScreen Component:
 * Confirms registration by taking a 6-digit confirmation pin sent to the user email inbox.
 */
function VerifyScreen({ email, setScreen }: { email: string; setScreen: (s: Screen) => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Code verification network submittal
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Please enter a 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyEmail({ email, code });

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Re-sends validation email code context
  const handleResend = async () => {
    try {
      await authApi.resendCode(email);
      alert("A new verification code context has been sent to your inbox.");
    } catch (err) {
      console.error("Resend error context:", err);
    }
  };

  return (
    <main className="min-h-screen pt-14 bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary" />
            <span className="text-2xl font-black tracking-widest uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Verify Your Email</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            We sent a 6‑digit code to <strong className="text-foreground">{email || "your email"}</strong>. Enter it below to activate your account.
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleVerify}>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest uppercase text-foreground/80 font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Verification Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 123456"
              value={code}
              // Only allows typing numbers and limits length to 6 characters
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-muted border border-border px-4 py-3 text-foreground text-sm placeholder:text-foreground/80/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all text-center tracking-widest font-mono"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            {error && <span className="text-[10px] text-destructive tracking-wider">{error}</span>}
          </div>
          <button type="submit" disabled={loading || code.length !== 6} className="mt-2 w-full py-3.5 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={handleResend} className="text-xs text-primary hover:opacity-80 transition-opacity" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Resend Code
          </button>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center">
          <button onClick={() => setScreen("login")} className="text-sm text-foreground/80 hover:text-foreground transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            ← Back to Log In
          </button>
        </div>
      </div>
    </main>
  );
}

/**
 * Main Export AuthPage Component:
 * Controls state routing for which view to render, and handles pulling live preview data from backend.
 */
export default function AuthPage() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [registeredEmail, setRegisteredEmail] = useState("");

  /**
   * Data Hook Effect:
   * Fetches preview live games and scoreboard data at the same time whenever a user returns to the landing view.
   */
  useEffect(() => {
    async function fetchPremData() {
      try {
        const [liveMatches, liveLeaderboard] = await Promise.all([
          authApi.getLandingMatches(),
          authApi.getLandingLeaderboard() 
        ]);
        
        setMatches(liveMatches);
    
        // Only set the state once, using the correct property
        if (liveLeaderboard && Array.isArray(liveLeaderboard.users)) {
          // Use .slice(0, 10) to limit the array to the first 10 items
          setLeaderboard(liveLeaderboard.users.slice(0, 9));
        } else {
          console.error("Data structure unexpected:", liveLeaderboard);
          setLeaderboard([]); // Fallback to empty array to prevent crashing
        }
      } catch (error) {
        console.error("Failed to parse dynamic live metrics from backend:", error);
      }
    }

    // Remove the 'if (screen === "landing")' condition 
    // to fetch data immediately on mount
    fetchPremData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-background">
      <NavBar screen={screen} setScreen={setScreen} />
      {screen === "landing" && (
        <LandingScreen matches={matches} leaderboard={leaderboard} setScreen={setScreen} />
      )}
      {screen === "login" && (
        <LoginScreen leaderboard={leaderboard} setScreen={setScreen} />
      )}
      {screen === "register" && (
        <RegisterScreen setScreen={setScreen} onRegister={setRegisteredEmail} />
      )}
      {screen === "verify" && (
        <VerifyScreen email={registeredEmail} setScreen={setScreen} />
      )}
    </div>
  );
}