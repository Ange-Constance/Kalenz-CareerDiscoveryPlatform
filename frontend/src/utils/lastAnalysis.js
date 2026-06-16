const STORAGE_KEY = 'lastAnalysis';

export function getLastAnalysis() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setLastAnalysis(analysis) {
  if (!analysis) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAnalysis(analysis)));
}

export function normalizeAnalysis(raw) {
  if (!raw) return null;

  const scores = raw.confidence_scores || {};
  const predicted = raw.predicted_career || raw.top_career || '';
  const topScore = predicted ? scores[predicted] : null;

  return {
    id: raw.id,
    predicted_career: predicted,
    confidence_scores: scores,
    confidence_pct:
      raw.confidence_pct ??
      (topScore != null ? Math.round(topScore * 1000) / 10 : undefined),
    narrative: raw.narrative || '',
    cv_filename: raw.cv_filename || '',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export { STORAGE_KEY };
