// Prediction endpoints. TODO(Gia): implement using models/Prediction.

exports.submit = async (req, res) => {
  // TODO: upsert prediction for req.user; reject if fixture is locked / past kickoff
  res.status(501).json({ message: "submit not implemented" });
};

exports.getMine = async (req, res) => {
  // TODO: return the logged-in user's predictions
  res.status(501).json({ message: "getMine not implemented" });
};
