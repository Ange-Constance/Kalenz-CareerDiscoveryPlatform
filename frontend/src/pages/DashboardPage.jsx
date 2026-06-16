import { Link } from 'react-router-dom';
import { CAREER_ICONS } from '../data/roadmapData';
import { getLastAnalysis } from '../utils/lastAnalysis';

export default function DashboardPage() {
  const analysis = getLastAnalysis();

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center page-enter">
        <h1 className="page-title mb-3">Welcome to KarrerLenz</h1>
        <p className="page-subtitle mb-8 max-w-md">
          Upload your CV to get started with AI-powered career discovery.
        </p>
        <Link to="/upload" className="btn-primary">
          Upload Your CV
        </Link>
      </div>
    );
  }

  const score = analysis.confidence_pct
    ?? Math.round((analysis.confidence_scores?.[analysis.predicted_career] || 0) * 100);

  return (
    <div className="w-full max-w-3xl page-enter">
      <h1 className="page-title mb-2">Your Career Snapshot</h1>
      <p className="page-subtitle mb-8">Based on your latest CV analysis</p>

      <div className="panel-orange p-8 text-center">
        <div className="text-5xl mb-4">
          {CAREER_ICONS[analysis.predicted_career] || '🎯'}
        </div>
        <p className="text-sm text-klenz-orange font-semibold uppercase tracking-wider mb-2">
          Top Match
        </p>
        <h2 className="text-2xl font-semibold text-white mb-2">{analysis.predicted_career}</h2>
        <p className="text-klenz-muted text-sm mb-6">{score}% confidence</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/results" className="btn-primary text-sm">
            View Full Results
          </Link>
          <Link to="/dashboard/profile" className="btn-outline text-sm">
            Talent Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
