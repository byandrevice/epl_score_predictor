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
      // MOCK LOGIC:
      // If rank is 1 (index 0), show "up". 
      // If rank is 2 (index 1), show "down".
      // All others show "same".
      let mockTrend = "same";
      if (index === 0) mockTrend = "up";
      if (index === 1) mockTrend = "down";
  
      return {
        rank: index + 1,
        userId: user._id.toString(),
        name: user.name || "Anonymous",
        pts: user.pts || 0,
        accuracy: user.accuracy || "0%",
        trend: mockTrend, // Uses the mock logic above
        predictionsPublic: !!user.predictionsPublic,
      };
    });

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