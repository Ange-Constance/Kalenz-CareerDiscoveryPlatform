import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CAREER_ICONS } from '../data/roadmapData';
import { getAnalysisHistory } from '../services/api';
import { getLastAnalysis } from '../utils/lastAnalysis';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    getAnalysisHistory()
      .then((result) => setAnalyses(result.data || []))
      .catch(() => {
        const last = getLastAnalysis();
        setAnalyses(last ? [last] : []);
      });
  }, []);

  if (!analyses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center page-enter">
        <h1 className="page-title mb-3">Welcome to KarrerLenz</h1>
        <p className="page-subtitle mb-8 max-w-md">
          Upload your profile to get started with AI-powered career discovery.
        </p>
        <Link to="/upload" className="btn-primary">
          New Analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1">Your Career Dashboard</h1>
          <p className="page-subtitle">{analyses.length} analyses on record</p>
        </div>
        <Link to="/upload" className="btn-primary text-sm">
          New Analysis
        </Link>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis) => {
          const score =
            analysis.confidence_pct ??
            Math.round((analysis.confidence_scores?.[analysis.predicted_career] || 0) * 100);

          return (
            <div key={analysis.id} className="panel p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {CAREER_ICONS[analysis.predicted_career] || '🎯'}
                </span>
                <div>
                  <p className="font-semibold text-white">{analysis.predicted_career}</p>
                  <p className="text-xs text-klenz-muted">
                    {new Date(analysis.created_at).toLocaleDateString()} · {score}% confidence
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/results', { state: { analysis } })}
                className="btn-outline text-sm py-2 px-4"
              >
                View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
