import React from 'react';
import { useNavigate } from "react-router";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-16 h-16 rounded-xl bg-muted/40 border border-border flex items-center justify-center">
        <Construction size={28} className="text-muted-foreground" />
      </div>
      <div>
        <h1
          className="text-3xl font-black tracking-widest uppercase text-foreground mb-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {title}
        </h1>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
          This page is coming soon.
        </p>
      </div>
      <button
        onClick={() => navigate("/dashboard/fixtures")}
        className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity rounded-sm"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}
      >
        Back to Fixtures
      </button>
    </div>
  );
}
