// Leaderboard endpoint. TODO(Gia): aggregate total points per user from Prediction.
const Prediction = require("../models/Prediction");

// Get users ranked by total points
exports.getTop = async (req, res) => {
  // TODO: return users ranked by total points (desc)
  try {
    
    const leaderboard = await Prediction.aggregate([

      // Group predictions by user
      {
        $group: {
          _id: "$user",
          totalPoints: {
            $sum: "$pointsAwarded"
          }
        }
      },

      {
        $sort: {
          totalPoints: -1
        }
      },

      // Join with User collection
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },

      //Convert user array into object
      {
        $unwind: "$user"
      },

      {
        $project: {
          _id: 0,
          userId: "user._id",
          username: "$user.username",
          totalPoints: 1
        }
      }

    ]);

    res.status(200).json({
      success: true,
      leaderboard
    });
  
  } catch (err) {
    next(err);
  }

};
