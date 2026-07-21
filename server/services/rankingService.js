const User = require("../models/User");

// Single source of truth for numeric rank: total points across all users
// (all users included, even those with zero predictions, via a left join),
// ties broken by name — mirrors leaderboardController.getTop's sort exactly,
// so a rank shown on Profile/Stats/public-profile never disagrees with the
// actual Leaderboard page.
async function getRankedUsers() {
  const ranked = await User.aggregate([
    {
      $lookup: {
        from: "predictions",
        localField: "_id",
        foreignField: "user",
        as: "userPredictions",
      },
    },
    {
      $project: {
        name: { $concat: ["$firstName", " ", "$lastName"] },
        pts: { $ifNull: [{ $sum: "$userPredictions.pointsAwarded" }, 0] },
      },
    },
    { $sort: { pts: -1, name: 1 } },
  ]);

  return ranked
    .filter((u) => u.name)
    .map((u, index) => ({ userId: u._id.toString(), pts: u.pts, rank: index + 1 }));
}

function findRank(rankedUsers, userId) {
  const entry = rankedUsers.find((u) => u.userId === userId);
  return entry ? entry.rank : "Unranked";
}

module.exports = { getRankedUsers, findRank };
