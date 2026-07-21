import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLoaderData } from "react-router";
import { Zap, LogOut, LayoutGrid, Crosshair, Trophy, BarChart2, User } from "lucide-react";

const NAV_LINKS = [
  { to: "/dashboard/fixtures", label: "Fixtures", icon: LayoutGrid },
  { to: "/dashboard/predict", label: "Predict", icon: Crosshair },
  { to: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/dashboard/stats", label: "Stats", icon: BarChart2 },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

// Reflect the strict data shape delivered by the backend loader
interface DashboardLoaderData {
  username: string;
  avatarInitials: string;
  globalRank: string;
  gameweekNumber: number;
  gameweekIsOpen: boolean;
  deadlineText: string;
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Instantly consume real-time layout metrics resolved by routes.tsx
  const data = useLoaderData() as DashboardLoaderData;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("auth_token");
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-14 gap-6">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 flex-shrink-0 mr-2"
          >
            <Zap size={15} className="text-primary" fill="currentColor" />
            <span
              className="text-sm font-black tracking-widest uppercase text-foreground hidden sm:block"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em" }}
            >
              PremPredict
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border flex-shrink-0" />

          {/* Nav Links */}
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-widest uppercase whitespace-nowrap transition-all rounded-sm ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`
                }
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
              >
                <Icon size={12} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            {data ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-sm border border-border">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {data.avatarInitials}
                  </span>
                </div>
                <span className="text-xs text-foreground font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {data.username}
                </span>
              </div>
            ) : (
              <div className="hidden md:block w-24 h-8 bg-muted animate-pulse rounded-sm" />
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-border/80 transition-colors rounded-sm disabled:opacity-50"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
            >
              <LogOut size={12} className={isLoggingOut ? "animate-spin" : ""} />
              <span className="hidden sm:block uppercase tracking-widest">
                {isLoggingOut ? "Exiting..." : "Logout"}
              </span>
            </button>
          </div>
        </div>

        {/* GW Badge strip */}
        <div className="bg-secondary/40 border-t border-border px-4 md:px-8 py-1.5 flex items-center gap-4 max-w-full overflow-x-auto scrollbar-hide h-9">
          {data ? (
            <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${data.gameweekIsOpen ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                <span
                  className="text-[10px] tracking-widest text-primary uppercase font-semibold"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  GW{data.gameweekNumber} · {data.gameweekIsOpen ? "Predictions Open" : "Closed"}
                </span>
              </div>
              <div className="h-3 w-px bg-border flex-shrink-0" />
              <span
                className="text-[10px] tracking-wider text-muted-foreground uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Deadline: {data.deadlineText}
              </span>
              <div className="ml-auto flex-shrink-0">
                <span
                  className="text-[10px] tracking-widest text-muted-foreground uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Your rank: <span className="text-foreground font-semibold">{data.globalRank}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}