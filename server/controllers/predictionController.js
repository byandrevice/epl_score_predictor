// Prediction endpoints. TODO(Gia): implement using models/Prediction.
const Prediction = require("../models/Prediction");
const Fixture = require("../models/Fixture");

exports.submit = async (req, res, next) => {
  // TODO: upsert prediction for req.user; reject if fixture is locked / past kickoff
  try {
    const userId = req.user.id; // set by the auth middleware after verifying the JWT - never trust a userId from the body
    const { fixtureId, homeScore, awayScore } = req.body;

    if (fixtureId === undefined || homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ success: false, message: "fixturedId, homeScore, awayScore are required." });
    }
    
    const home = Number(homeScore);
    const away = Number(awayScore);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      return res.status(400).json({ success: false, message: "Score must be non-negative whole numbers." });
    }

    const fixture = await Fixture.findById(fixtureId);
    if (!fixture) {
      return res.status(404).json({ success: false, message: "Fixture not found." });
    }

    if (fixture.locked || fixture.kickoff.getTime() <= Date.now()) {
      return res.status(403).json({ success: false, message: "Prediction are closed for this fixture."});
    }

    // upsert: update if this user already predicted this fixture, otherwise create a new one
    const prediction = await Prediction.findOneAndUpdate(
      { user: userId, fixture: fixtureId },
      { user: userId, fixture: fixtureId, homeScore: home, awayScore: away},
      { new: true, upsert: true, setDefaultsOnInsert: true}
    );

    return res.status(200).json({
      success: true,
      message: "Prediction saved.",
      prediction: {
        id: prediction._id.toString(),
        fixtureId: prediction.fixture.toString(), // still just an ObjectId here, not a full fixture
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res, next) => {
  // TODO: return the logged-in user's predictions
  try {
    // get every prediction belonging to the logged-in user,
    // .populate("fixture") swaps the stored fixture ID for the real Fixture document
    const predictions = await Prediction.find({ user: req.user.id }).populate("fixture");

    return res.status(200).json(
      predictions.map((p) => ({
        id: p._id.toString(),
        fixtureId: p.fixture._id.toString(), // available because of populate()
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        pointsAwarded: p.pointsAwarded, // 0 until a fixture is graded
      }))
    );
  } catch (err) {
    next(err);
  }
};

// Returns the next gameweek's fixtures for the Predict page: fixture info,
// this user's existing draft prediction (if any), and community outcome stats.
// NOTE: homeColor/homeDim/awayColor/awayDim from the frontend's PredictMatch
// type are NOT included here on purpose — those are cosmetic styling values,
// not data this backend stores. Frontend should map those from a static
// color table keyed by homeShort/awayShort instead.
exports.getPredictFixtures = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { week, year } = req.query;

    const Team = require("../models/Team");
    const teams = await Team.find({});
    const teamMap = {};
    teams.forEach(t => teamMap[t.shortName] = t.logoUrl);

    let targetWeek, seasonStartYear;
    if (week && year) {
      targetWeek = week;               // week is stored as "GW38" string, keep as-is
      seasonStartYear = Number(year);
    } else {
      const nextFixture = await Fixture.findOne({ kickoff: { $gte: new Date() } }).sort({ kickoff: 1 });
      if (!nextFixture) return res.status(200).json({ gameweek: null, deadline: null, matches: [] });
      const kickoffYear = nextFixture.kickoff.getUTCFullYear();
      const kickoffMonth = nextFixture.kickoff.getUTCMonth();
      seasonStartYear = kickoffMonth >= 7 ? kickoffYear : kickoffYear - 1;
      targetWeek = nextFixture.week;
    }

    const seasonStart = new Date(`${seasonStartYear}-08-01T00:00:00.000Z`);
    const seasonEnd = new Date(`${seasonStartYear + 1}-08-01T00:00:00.000Z`);

    const fixtures = await Fixture.find({
      week: targetWeek,
      kickoff: { $gte: seasonStart, $lt: seasonEnd },
    }).sort({ kickoff: 1 });

    const fixtureIds = fixtures.map((f) => f._id);

    const myPredictions = await Prediction.find({ user: userId, fixture: { $in: fixtureIds } });

    // Community outcome distribution logic remains the same...
    const communityStats = await Prediction.aggregate([
      { $match: { fixture: { $in: fixtureIds } } },
      {
        $addFields: {
          outcome: {
            $cond: [
              { $gt: ["$homeScore", "$awayScore"] }, "home",
              { $cond: [{ $lt: ["$homeScore", "$awayScore"] }, "away", "draw"] },
            ],
          },
        },
      },
      { $group: { _id: { fixture: "$fixture", outcome: "$outcome" }, count: { $sum: 1 } } },
    ]);

    // 3. Map matches with logos included
    const matches = fixtures.map((f) => {
      const mine = myPredictions.find((p) => p.fixture.toString() === f._id.toString());
      const statsForFixture = communityStats.filter((s) => s._id.fixture.toString() === f._id.toString());
      const totalPredictions = statsForFixture.reduce((sum, s) => sum + s.count, 0);
      const countFor = (outcome) => statsForFixture.find((s) => s._id.outcome === outcome)?.count || 0;

      return {
        id: f._id.toString(),
        home: f.home,
        homeShort: f.homeShort,
        homeCrest: f.homeCrest,
        homeLogoUrl: teamMap[f.homeShort.trim()] || null, // New: Add logo URL
        away: f.away,
        awayShort: f.awayShort,
        awayCrest: f.awayCrest,
        awayLogoUrl: teamMap[f.awayShort.trim()] || null, // New: Add logo URL
        kickoff: f.kickoff,
        venue: f.venue,
        homeScore: mine ? String(mine.homeScore) : "",
        awayScore: mine ? String(mine.awayScore) : "",
        locked: f.locked || f.kickoff.getTime() <= Date.now(),
        community: {
          homeWin: countFor("home"),
          draw: countFor("draw"),
          awayWin: countFor("away"),
          totalPredictions,
        },
      };
    });

    return res.status(200).json({
      gameweek: targetWeek,
      deadline: fixtures[0]?.kickoff || null,
      matches,
    });
  } catch (err) {
    next(err);
  }
};

// Batch submit: accepts { predictions: [{ matchId, homeScore, awayScore }, ...] }
// and upserts each one for the logged-in user, same rules as submit() but for many at once.
exports.submitAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { predictions } = req.body;

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return res.status(400).json({ success: false, message: "predictions array is required." });
    }

    const results = [];
    for (const p of predictions) {
      const { matchId, homeScore, awayScore } = p;
      const home = Number(homeScore);
      const away = Number(awayScore);

      if (!matchId || !Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
        results.push({ matchId, success: false, message: "Invalid prediction data." });
        continue;
      }

      const fixture = await Fixture.findById(matchId);
      if (!fixture) {
        results.push({ matchId, success: false, message: "Fixture not found." });
        continue;
      }

      if (fixture.locked || fixture.kickoff.getTime() <= Date.now()) {
        results.push({ matchId, success: false, message: "Predictions are closed for this fixture." });
        continue;
      }

      await Prediction.findOneAndUpdate(
        { user: userId, fixture: matchId },
        { user: userId, fixture: matchId, homeScore: home, awayScore: away },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      results.push({ matchId, success: true });
    }

    const anyFailed = results.some((r) => !r.success);
    return res.status(anyFailed ? 207 : 200).json({ success: !anyFailed, results });
  } catch (err) {
    next(err);
  }
};

// Powers the Stats page: this user's graded prediction history (with results
// classified as exact/outcome/wrong) plus summary stats. Only fixtures with a
// real final score count — ungraded predictions aren't "results" yet.
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { week, year } = req.query;

    const predictions = await Prediction.find({ user: userId }).populate("fixture");
    const graded = predictions.filter((p) => {
      if (!p.fixture) return false;
      if (p.fixture.finalHomeScore === null || p.fixture.finalAwayScore === null) return false;
      if (week && p.fixture.week !== week) return false;

      if (year) {
        // Same Aug–Jul season-boundary logic used in fixtureRoutes.js /
        // predictionController.getPredictFixtures — "year" means season-start year.
        const kickoffYear = p.fixture.kickoff.getUTCFullYear();
        const kickoffMonth = p.fixture.kickoff.getUTCMonth(); // 0 = Jan
        const seasonStartYear = kickoffMonth >= 7 ? kickoffYear : kickoffYear - 1;
        if (seasonStartYear !== Number(year)) return false;
      }

      return true;
    });

    const outcome = (h, a) => (h > a ? "HOME" : h < a ? "AWAY" : "DRAW");

    const results = graded
      .map((p) => {
        const f = p.fixture;
        const isExact = p.homeScore === f.finalHomeScore && p.awayScore === f.finalAwayScore;
        const sameOutcome = outcome(p.homeScore, p.awayScore) === outcome(f.finalHomeScore, f.finalAwayScore);
        const result = isExact ? "correct_score" : sameOutcome ? "correct_outcome" : "wrong";

        return {
          id: p._id.toString(),
          homeTeam: f.home,
          awayTeam: f.away,
          homeCrest: f.homeCrest,
          awayCrest: f.awayCrest,
          finalHome: f.finalHomeScore,
          finalAway: f.finalAwayScore,
          predHome: p.homeScore,
          predAway: p.awayScore,
          result,
          points: p.pointsAwarded,
          matchDate: f.kickoff,
          venue: f.venue,
          week: f.week, // used below for "this gameweek", stripped from final output
        };
      })
      .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

    const totalPredictions = results.length;
    const correctScores = results.filter((r) => r.result === "correct_score").length;
    const anyPoints = results.filter((r) => r.result !== "wrong").length;
    const seasonAccuracy = totalPredictions > 0 ? Math.round((anyPoints / totalPredictions) * 100) : 0;

    // "Points this gameweek" = sum of points for the most recent graded week
    let pointsThisGameweek = 0;
    if (results.length > 0) {
      const mostRecentWeek = results[results.length - 1].week;
      pointsThisGameweek = results
        .filter((r) => r.week === mostRecentWeek)
        .reduce((sum, r) => sum + r.points, 0);
    }

    return res.status(200).json({
      summary: { pointsThisGameweek, correctScores, totalPredictions, seasonAccuracy },
      predictions: results.map(({ week, ...rest }) => rest), // drop internal-only field
    });
  } catch (err) {
    next(err);
  }
};