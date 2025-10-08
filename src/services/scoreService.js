exports.calculateCvScore = (scores) => {
  const weights = {
    technical: 0.4,
    experience: 0.25,
    achievements: 0.2,
    cultural: 0.15,
  };

  const total =
    (scores.technical || 0) * weights.technical +
    (scores.experience || 0) * weights.experience +
    (scores.achievements || 0) * weights.achievements +
    (scores.cultural || 0) * weights.cultural;

  return parseFloat(total.toFixed(2));
};

exports.calculateProjectScore = (scores) => {
  const weights = {
    correctness: 0.3,
    codeQuality: 0.25,
    resilience: 0.2,
    documentation: 0.15,
    creativity: 0.1,
  };

  const total =
    (scores.correctness || 0) * weights.correctness +
    (scores.codeQuality || 0) * weights.codeQuality +
    (scores.resilience || 0) * weights.resilience +
    (scores.documentation || 0) * weights.documentation +
    (scores.creativity || 0) * weights.creativity;

  return parseFloat(total.toFixed(2));
};

exports.calculateOverallScore = (cvScore, projectScore) => {
  const weighted = cvScore * 0.2 + projectScore * 0.8;
  return parseFloat(weighted.toFixed(2));
};
