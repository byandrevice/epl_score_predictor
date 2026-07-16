// /server/routes/statsRoutes.js
const express = require('express');
const router = express.Router(); // <--- THIS MUST BE DEFINED FIRST!
const Standing = require('../models/Standing');
const Fixture = require("../models/Fixture"); // Required for standings generator

// Now you can safely attach routes to 'router'
router.get("/generate-standings", async (req, res) => {
    try {
      const { week, season } = req.query;
      const queryWeek = week || "GW1";
      const querySeason = season || "2025/26";
  
      // "2025/26" -> season start year 2025 -> Aug 2025–Jul 2026 window,
      // same boundary logic used in fixtureRoutes.js / predictionController.js
      const seasonStartYear = parseInt(querySeason.split("/")[0], 10);
      const seasonStart = new Date(`${seasonStartYear}-08-01T00:00:00.000Z`);
      const seasonEnd = new Date(`${seasonStartYear + 1}-08-01T00:00:00.000Z`);
  
      const fixtures = await Fixture.find({ 
        week: queryWeek,
        kickoff: { $gte: seasonStart, $lt: seasonEnd },
        finalHomeScore: { $ne: null },
        finalAwayScore: { $ne: null }
      });

    if (fixtures.length === 0) {
      return res.status(400).json({ message: `No played fixtures found for ${queryWeek}` });
    }

    // 2. Aggregate stats for each team
    const teamStats = {};

    const getOrCreateTeam = (name, crest) => {
      if (!teamStats[name]) {
        teamStats[name] = {
          teamName: name,
          crest: crest || "⚽",
          played: 0, won: 0, drawn: 0, lost: 0,
          gf: 0, ga: 0, gd: 0, pts: 0,
          form: [], week: queryWeek, season: querySeason
        };
      }
      return teamStats[name];
    };

    fixtures.forEach(f => {
      const home = getOrCreateTeam(f.home, f.homeCrest);
      const away = getOrCreateTeam(f.away, f.awayCrest);

      const hScore = f.finalHomeScore;
      const aScore = f.finalAwayScore;

      home.played += 1;
      away.played += 1;
      home.gf += hScore;
      home.ga += aScore;
      away.gf += aScore;
      away.ga += hScore;

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

    // 3. Convert to array and sort (Points -> GD -> GF)
    const sortedStandings = Object.values(teamStats).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    // 4. Save to the Standing collection
    await Standing.deleteMany({ week: queryWeek, season: querySeason });
    await Standing.insertMany(sortedStandings);

    res.json({ success: true, message: `Successfully compiled and saved standings for ${queryWeek}!`, data: sortedStandings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/table', async (req, res) => {
    try {
      const { week, season } = req.query;
      const queryWeek = week || 'GW1';
      const rawSeason = season || '2025';
      let querySeason = rawSeason;
      if (rawSeason && !rawSeason.includes('/')) {
        querySeason = `${rawSeason}/${(Number(rawSeason) + 1).toString().slice(-2)}`;
      }
  
      if (queryWeek === 'All') {
        // Cumulative season table — aggregate every played fixture in this
        // season on the fly, rather than reading one week's Standing snapshot.
        const seasonStartYear = parseInt(querySeason.split("/")[0], 10);
        const seasonStart = new Date(`${seasonStartYear}-08-01T00:00:00.000Z`);
        const seasonEnd = new Date(`${seasonStartYear + 1}-08-01T00:00:00.000Z`);
  
        const fixtures = await Fixture.find({
          kickoff: { $gte: seasonStart, $lt: seasonEnd },
          finalHomeScore: { $ne: null },
          finalAwayScore: { $ne: null },
        }).sort({ kickoff: 1 });
  
        const teamStats = {};
        const getOrCreateTeam = (name, crest) => {
          if (!teamStats[name]) {
            teamStats[name] = { teamName: name, crest: crest || "⚽", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] };
          }
          return teamStats[name];
        };
  
        fixtures.forEach(f => {
          const home = getOrCreateTeam(f.home, f.homeCrest);
          const away = getOrCreateTeam(f.away, f.awayCrest);
          const hScore = f.finalHomeScore, aScore = f.finalAwayScore;
  
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
  
        const sorted = Object.values(teamStats)
          .map(t => ({ ...t, form: t.form.slice(-5) })) // keep only last 5 for the Form badges
          .sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf));
  
        const formattedTable = sorted.map((doc, index) => ({
          _id: `${doc.teamName}-all`,
          pos: index + 1,
          name: doc.teamName,
          short: doc.teamName ? doc.teamName.substring(0, 3).toUpperCase() : "TEAM",
          crest: doc.crest,
          played: doc.played, won: doc.won, drawn: doc.drawn, lost: doc.lost,
          gf: doc.gf, ga: doc.ga, gd: doc.gd, pts: doc.pts,
          form: doc.form, trend: "same",
        }));
  
        return res.json(formattedTable);
      }
  

    const standings = await Standing.find({ week: queryWeek, season: querySeason })
        .sort({ pts: -1, gd: -1, gf: -1 });

    console.log(`[API] Found ${standings.length} team standings.`);

    if (!standings || standings.length === 0) {
        return res.status(200).json([]);
    }

    const formattedTable = standings.map((doc, index) => ({
        _id: doc._id,
        pos: index + 1,
        name: doc.teamName,
        short: doc.teamName ? doc.teamName.substring(0, 3).toUpperCase() : "TEAM",
        crest: doc.crest || "⚽",
        played: doc.played || 0,
        won: doc.won || 0,
        drawn: doc.drawn || 0,
        lost: doc.lost || 0,
        gf: doc.gf || 0,
        ga: doc.ga || 0,
        gd: doc.gd || 0,
        pts: doc.pts || 0,
        form: doc.form || [],
        trend: doc.trend || "same"
    }));

    res.json(formattedTable);
    } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: error.message });
    }
});

module.exports = router; // <--- This must remain at the bottom