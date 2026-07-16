require("dotenv").config();
const mongoose = require("mongoose");
const Fixture = require("./models/Fixture");
const Standing = require("./models/Standing");

const SEASONS = ["2025/26", "2026/27"]; // add more if you have other seasons seeded

async function generateForWeek(queryWeek, querySeason) {
  // "2025/26" -> season start year 2025 -> Aug 2025-Jul 2026 window.
  // Without this, fixtures with the same `week` label from a different
  // season get pulled in together (this was the actual bug).
  const seasonStartYear = parseInt(querySeason.split("/")[0], 10);
  const seasonStart = new Date(`${seasonStartYear}-08-01T00:00:00.000Z`);
  const seasonEnd = new Date(`${seasonStartYear + 1}-08-01T00:00:00.000Z`);

  const fixtures = await Fixture.find({
    week: queryWeek,
    kickoff: { $gte: seasonStart, $lt: seasonEnd },
    finalHomeScore: { $ne: null },
    finalAwayScore: { $ne: null },
  });

  if (fixtures.length === 0) {
    console.log(`  ${queryWeek} (${querySeason}): no played fixtures, skipping`);
    return;
  }

  const teamStats = {};
  const getOrCreateTeam = (name, crest) => {
    if (!teamStats[name]) {
      teamStats[name] = {
        teamName: name,
        crest: crest || "⚽",
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, pts: 0,
        form: [], week: queryWeek, season: querySeason,
      };
    }
    return teamStats[name];
  };

  fixtures.forEach((f) => {
    const home = getOrCreateTeam(f.home, f.homeCrest);
    const away = getOrCreateTeam(f.away, f.awayCrest);
    const hScore = f.finalHomeScore;
    const aScore = f.finalAwayScore;

    home.played += 1; away.played += 1;
    home.gf += hScore; home.ga += aScore;
    away.gf += aScore; away.ga += hScore;

    if (hScore > aScore) {
      home.won += 1; home.pts += 3; home.form.push("W");
      away.lost += 1; away.form.push("L");
    } else if (hScore < aScore) {
      away.won += 1; away.pts += 3; away.form.push("W");
      home.lost += 1; home.form.push("L");
    } else {
      home.drawn += 1; home.pts += 1; home.form.push("D");
      away.drawn += 1; away.pts += 1; away.form.push("D");
    }
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  });

  const sortedStandings = Object.values(teamStats).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  await Standing.deleteMany({ week: queryWeek, season: querySeason });
  await Standing.insertMany(sortedStandings);
  console.log(`  ${queryWeek} (${querySeason}): saved ${sortedStandings.length} teams`);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const season of SEASONS) {
    console.log(`Season ${season}:`);
    for (let i = 1; i <= 38; i++) {
      await generateForWeek(`GW${i}`, season);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});