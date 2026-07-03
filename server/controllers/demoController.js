// Demo simulation flow: admin creates a fixture -> users predict -> lock ->
// enter final score -> calculate points -> update leaderboard.
// TODO(Gia): implement using services/demoSimulationService.

exports.createFixture = async (req, res) => {
  res.status(501).json({ message: "createFixture not implemented" });
};

exports.lockFixture = async (req, res) => {
  res.status(501).json({ message: "lockFixture not implemented" });
};

exports.setFinalScore = async (req, res) => {
  res.status(501).json({ message: "setFinalScore not implemented" });
};

exports.calculatePoints = async (req, res) => {
  res.status(501).json({ message: "calculatePoints not implemented" });
};
