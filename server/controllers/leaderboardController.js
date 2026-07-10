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
          pts: { $ifNull: [{ $sum: "$userPredictions.pointsAwarded" }, 0] },
          accuracy: {
            $cond: {
              if: { $gt: [{ $size: "$userPredictions" }, 0] },
              then: "0%", 
              else: "0%"
            }
          }
        }
      },
      // 3. Sort by highest points down to 0
      { $sort: { pts: -1, name: 1 } }
    ]);

    // 4. Map the results to add rankings and match your frontend's expected format
    const rankedUsers = leaderboard
      .filter(user => user.name) // Only include users with names
      .map((user, index) => ({
        rank: index + 1,
        userId: user._id.toString(),
        name: user.name || "Anonymous",
        pts: user.pts || 0,
        accuracy: user.accuracy || "0%",
        trend: "same", // Default trend status
    }));

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