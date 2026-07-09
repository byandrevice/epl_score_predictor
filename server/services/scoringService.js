// Points calculation for a prediction vs. the final score.
// TODO(Gia): finalize scoring rules (exact score / correct outcome / goal margin).

// Points calculation for a prediction vs. the final score.
// Rules from [leader]'s proposal (confirm with the team before finalizing):
//   goalError = |predictedHome - finalHome| + |predictedAway - finalAway|
//
//   Exact score (goalError = 0):                        5 pts
//   Correct winner/draw, goalError = 1:                  3 pts
//   Correct winner/draw, goalError = 2:                  2 pts
//   Correct winner/draw, goalError >= 3:                 1 pt
//   Wrong winner/draw,   goalError <= 2:                 1 pt
//   Wrong winner/draw,   goalError >= 3:                 0 pts

function outcome(homeScore, awayScore) {
  if (homeScore > awayScore) return "HOME";
  if (homeScore < awayScore) return "AWAY";
  return "DRAW";
}

exports.calculatePoints = (prediction, finalHomeScore, finalAwayScore) => {
  const { homeScore, awayScore } = prediction;

  // how far off each individual score was, added together
  const goalError =
    Math.abs(homeScore - finalHomeScore) + Math.abs(awayScore - finalAwayScore);

  // goalError === 0 can only happen if both scores matched exactly
  if (goalError === 0) return 5;

  const correctOutcome = outcome(homeScore, awayScore) === outcome(finalHomeScore, finalAwayScore);

  if (correctOutcome) {
    if (goalError === 1) return 3;
    if (goalError === 2) return 2;
    return 1; // goalError >= 3
  }

  // wrong winner/draw
  return goalError <= 2 ? 1 : 0;
};