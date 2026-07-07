// Fixture endpoints. TODO(Gia): implement using models/Fixture.
const Fixture = require("../models/Fixture");

// Mongo documents come with an '_id' field; the expects a plain 'id'.
// This function converts one Fixture doc tinto flat shape
function toClientShape(fixture) {
  const f = fixture.toObject ? fixture.toObject() : fixture;
  return {
    id: f._id.toString(),
    home: f.home,
    homeShort: f.homeShort,
    homeCrest: f.homeCrest,
    away: f.away,
    awayShort: f.awayShort,
    awayCrest: f.awayCrest,
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
  // TODO: return upcoming fixtures (sorted by kickoff)
  try {
    const fixtures = await Fixture.find({ kickoff: { $gte: new Date() } }).sort({kickoff: 1}); 
    // This read as "find fixtures who kickoff time is at or after right now"-i.e. anything not yet played
    // .sort({ kickoff: 1 })-1 means ascending order (sooner first). -1 would mean latest first.
    
    return res.status(200).json(fixtures.map(toClientShape)); // returns an array, so we reshape every fixture in it using the helper function above.
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  // TODO: return a single fixture by id
  try {
    const fixture = await Fixture.findById(req.params.id);
    // comes from the route router.get("/:id", ...)-whatever's in the URL after /fixtures/ becomes req.params.id
    //Fixture.findById(...)-looks up a single document by its _id.

    if (!fixture) {
      return res.status(404).json({ message: "fixture not found."});
    }
    return res.status(200).json(toClientShape(fixture));
  } catch (err) {
    if (err.name === "CastError") { 
      return res.status(400).json({ message: "Invalid fixture id." });
    }
    next(err);
  }
};
