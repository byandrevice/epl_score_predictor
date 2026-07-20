const User = require("../models/User"); // Make sure to import your User model
const Prediction = require("../models/Prediction");

exports.getTop = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id; // Grabbed from your auth middleware

    const leaderboard = await User.aggregate([
      // 1. Join with Predictions collection (Left Outer Join)
      {
        $lookup: {
          from: "predictions", // must match your MongoDB collection name for predictions
          localField: "_id",
          foreignField: "user",
          as: "userPredictions"
        }
      },
      // 2. Calculate total points and accuracy
      {
        $project: {
          _id: 1,
          // Combine firstName and lastName with a space in between
          name: { 
            $concat: ["$firstName", " ", "$lastName"] 
          },
          predictionsPublic: { $ifNull: ["$predictionsPublic", false] },
          previousRank: 1,
          pts: { $ifNull: [{ $sum: "$userPredictions.pointsAwarded" }, 0] },
          accuracy: {
            $cond: {
              if: { $gt: [{ $size: "$userPredictions" }, 0] },
              then: {
                $concat: [
                  {
                    $toString: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $sum: {
                                    $map: {
                                      input: "$userPredictions",
                                      as: "p",
                                      in: { $cond: ["$$p.isCorrect", 1, 0] }
                                    }
                                  }
                                },
                                { $size: "$userPredictions" }
                              ]
                            },
                            100
                          ]
                        },
                        1 // 1 decimal place
                      ]
                    }
                  },
                  "%"
                ]
              }, // <-- comma here
              else: "0%"
            }
          }
        }
      },
      { $sort: { pts: -1, name: 1 } }
    ]);
    
    // 4. Map the results to add rankings and match your frontend's expected format
    const rankedUsers = leaderboard
    .filter(user => user.name)
    .map((user, index) => {
      const rank = index + 1;

      // Compare against the rank we stored last time we computed the leaderboard.
      // Lower rank number = better placement, so a decrease in number means "up".
      let trend = "same";
      if (typeof user.previousRank === "number") {
        if (rank < user.previousRank) trend = "up";
        else if (rank > user.previousRank) trend = "down";
      }

      return {
        rank,
        userId: user._id.toString(),
        name: user.name || "Anonymous",
        pts: user.pts || 0,
        accuracy: user.accuracy || "0%",
        trend,
        predictionsPublic: !!user.predictionsPublic,
      };
    });

    // 4b. Persist the newly computed ranks so the *next* request can diff against them.
    const bulkOps = rankedUsers.map(u => ({
      updateOne: {
        filter: { _id: u.userId },
        update: { $set: { previousRank: u.rank } },
      },
    }));
    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    // 5. Find the current user's profile for the sticky bar
    const currentUserData = rankedUsers.find(u => u.userId === currentUserId) || null;

    return res.status(200).json({
      success: true,
      users: rankedUsers,
      currentUser: currentUserData
    });

  } catch (err) {
    next(err);
  }
};