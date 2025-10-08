// scoring.js

/**
 * Hitung CV Match Rate (1–5 → 0–1)
 * Bobot:
 * - Technical (0.4)
 * - Experience (0.25)
 * - Achievements (0.2)
 * - Cultural Fit (0.15)
 */
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

  // Konversi dari skala 1–5 ke 0–1
  const normalized = total / 5;

  return parseFloat(normalized.toFixed(2)); // hasil: 0–1
};

/**
 * Hitung Project Score (1–5)
 * Bobot:
 * - Correctness (0.3)
 * - Code Quality (0.25)
 * - Resilience (0.2)
 * - Documentation (0.15)
 * - Creativity (0.1)
 */
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
  const normalizedProject = projectScore / 5;
  const weighted = cvScore * 0.2 + normalizedProject * 0.8;
  return parseFloat(weighted.toFixed(2));
};
