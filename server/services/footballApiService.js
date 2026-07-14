// Pulls real EPL fixture data from football-data.org and syncs it into
// our Fixture collection. Uses the built-in global fetch (Node 18+) —
// no extra dependency needed.
//
// Docs: https://docs.football-data.org/general/v4/index.html
// Free tier: 10 requests/minute, competition PL (Premier League) included.

const Fixture = require("../models/Fixture");

const API_BASE = "https://api.football-data.org/v4";

// One real football-data.org match object looks like:
// {
//   id: 12345,
//   utcDate: "2026-08-15T14:00:00Z",
//   status: "SCHEDULED" | "FINISHED" | "IN_PLAY" | "POSTPONED" | ...,
//   matchday: 1,
//   homeTeam: { name: "Arsenal FC", tla: "ARS", crest: "https://..." },
//   awayTeam: { name: "Chelsea FC", tla: "CHE", crest: "https://..." },
//   venue: "Emirates Stadium",              // not always present
//   score: { fullTime: { home: 2, away: 1 } } // only meaningful once FINISHED
// }

async function fetchRawMatches() {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_API_KEY is not set in .env");
  }

  const res = await fetch(`${API_BASE}/competitions/PL/matches`, {
    headers: { "X-Auth-Token": apiKey },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`football-data.org request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.matches; // array of match objects
}

// Turns one raw API match into our Fixture schema's shape.
function mapMatchToFixture(match) {
  const kickoff = new Date(match.utcDate);
  const isFinished = match.status === "FINISHED";

  return {
    externalId: match.id,
    home: match.homeTeam.name,
    homeShort: match.homeTeam.tla,
    homeCrest: match.homeTeam.crest,
    away: match.awayTeam.name,
    awayShort: match.awayTeam.tla,
    awayCrest: match.awayTeam.crest,
    date: kickoff.toISOString().slice(0, 10), // "2026-08-15"
    time: kickoff.toISOString().slice(11, 16), // "14:00"
    venue: match.venue || "TBD",
    week: `GW${match.matchday}`,
    kickoff,
    locked: match.status !== "SCHEDULED", // lock anything already started/finished/postponed
    finalHomeScore: isFinished ? match.score.fullTime.home : null,
    finalAwayScore: isFinished ? match.score.fullTime.away : null,
  };
}

// Fetches all PL matches and upserts each one by externalId, so running
// this repeatedly updates existing fixtures (e.g. score comes in after
// FINISHED) instead of creating duplicates.
async function syncFixtures() {
  const rawMatches = await fetchRawMatches();
  const results = { created: 0, updated: 0, failed: 0, total: rawMatches.length };

  for (const match of rawMatches) {
    try {
      const fixtureData = mapMatchToFixture(match);
      const existing = await Fixture.findOne({ externalId: match.id });

      await Fixture.findOneAndUpdate(
        { externalId: match.id },
        fixtureData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (existing) results.updated++;
      else results.created++;
    } catch (err) {
      console.error(`Failed to sync match ${match.id}:`, err.message);
      results.failed++;
    }
  }

  return results;
}

module.exports = { fetchRawMatches, mapMatchToFixture, syncFixtures };