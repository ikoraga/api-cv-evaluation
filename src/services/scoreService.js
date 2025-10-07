exports.calculateScore = (scores) => {
  const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
  if (validScores.length === 0) return 0;

  const total = validScores.reduce((a, b) => a + b, 0);
  return validScores.length ? total / validScores.length : 0;
};
