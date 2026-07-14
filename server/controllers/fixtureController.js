// Fixture endpoints. TODO(Gia): implement using models/Fixture.
const Fixture = require("../models/Fixture");
const Team = require("../models/Team");

// Mongo documents come with an '_id' field; the expects a plain 'id'.
// This function converts one Fixture doc tinto flat shape
function toClientShape(fixture, teamMap = {}) {
  const f = fixture.toObject ? fixture.toObject() : fixture;
  
  // Use logical OR to provide fallbacks if the fields are missing
  const homeKey = (f.homeShort || "").toUpperCase();
  const awayKey = (f.awayShort || "").toUpperCase();

  return {
    id: f._id.toString(),
    home: f.home || "Unknown",
    homeShort: f.homeShort || "N/A",
    homeLogoUrl: teamMap[homeKey] || f.homeCrest || "default-logo-url.png",
    away: f.away || "Unknown",
    awayShort: f.awayShort || "N/A",
    awayLogoUrl: teamMap[awayKey] || f.awayCrest || "default-logo-url.png",
    date: f.date,
    time: f.time,
    venue: f.venue,
    week: f.week,
    locked: f.locked,
    finalHomeScore: f.finalHomeScore,
    finalAwayScore: f.finalAwayScore,
  };
}

exports.getUpcoming = async (req, res, next) => {
  try {
    const fixtures = await Fixture.find({ kickoff: { $gte: new Date() } }).sort({ kickoff: 1 }); 
    const teams = await Team.find({}); // Fetch all teams

    // Map short names to their logo URLs
    const teamMap = {};
    teams.forEach(t => teamMap[t.shortName] = t.logoUrl);

    // Attach the logos to each fixture before sending
    const fixturesWithLogos = fixtures.map(f => {
      const obj = f.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        homeLogoUrl: teamMap[obj.homeShort] || "default-logo.png", // Pulls URL
        awayLogoUrl: teamMap[obj.awayShort] || "default-logo.png"
      };
    });

    return res.status(200).json(fixturesWithLogos);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const fixture = await Fixture.findById(req.params.id);

    if (!fixture) {
      return res.status(404).json({ message: "fixture not found."});
    }

    // Fetch teams so the single view also gets the logo URLs
    const teams = await Team.find({});
    const teamMap = {};
    teams.forEach(team => {
      teamMap[team.shortName] = team.logoUrl;
    });

    return res.status(200).json(toClientShape(fixture, teamMap));
  } catch (err) {
    if (err.name === "CastError") { 
      return res.status(400).json({ message: "Invalid fixture id." });
    }
    next(err);
  }
};

// Pulls real EPL fixtures from football-data.org and upserts them into
// the Fixture collection. Kept separate from the demo endpoints on purpose —
// if the external API is down or rate-limited, the demo flow still works
// as a fallback for presentations.
// POST /api/fixtures/sync
const footballApiService = require("../services/footballApiService");

exports.syncFromApi = async (req, res, next) => {
  try {
    const results = await footballApiService.syncFixtures();
    return res.status(200).json({ success: true, results });
  } catch (err) {
    next(err);
  }
};