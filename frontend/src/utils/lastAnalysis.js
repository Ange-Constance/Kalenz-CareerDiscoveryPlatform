const STORAGE_KEY = 'lastAnalysis';
const HISTORY_KEY = 'analysisHistory';
const MAX_HISTORY = 10;

export function getLastAnalysis() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAnalysisHistoryLocal() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setLastAnalysis(analysis) {
  if (!analysis) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAnalysis(analysis)));
}

export function addToAnalysisHistory(analysis) {
  if (!analysis) return;
  const normalized = normalizeAnalysis(analysis);
  const history = getAnalysisHistoryLocal().filter((item) => item.id !== normalized.id);
  history.unshift(normalized);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
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
    input_sources: raw.input_sources || [],
    github_username: raw.github_username || '',
    certificate_filename: raw.certificate_filename || '',
    key_skills: raw.key_skills || [],
    roadmap: raw.roadmap || null,
    analysis_version: raw.analysis_version || 'v3',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

export { STORAGE_KEY, HISTORY_KEY };
