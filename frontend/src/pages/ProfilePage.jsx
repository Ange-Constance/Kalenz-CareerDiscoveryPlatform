import { Link } from 'react-router-dom';
import { CAREER_ICONS } from '../data/roadmapData';
import { getLastAnalysis } from '../utils/lastAnalysis';

export default function ProfilePage() {
  const analysis = getLastAnalysis();

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center page-enter">
        <h1 className="page-title mb-2">Talent Profile</h1>
        <p className="page-subtitle mb-8 max-w-md">
          Upload and analyze your CV to see your AI-powered talent profile.
        </p>
        <Link to="/upload" className="btn-primary">
          Upload CV
        </Link>
      </div>
    );
  }

  const score = analysis.confidence_pct
    ?? Math.round((analysis.confidence_scores?.[analysis.predicted_career] || 0) * 100);

  const scores = Object.entries(analysis.confidence_scores || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1.5">Talent Profile</h1>
          <p className="page-subtitle">AI-generated insights from your CV</p>
        </div>
        <Link to="/upload" className="btn-ghost text-sm self-start">
          Run New Analysis
        </Link>
      </div>

      <div className="panel-orange p-6 mb-8 flex items-center gap-4">
        <span className="text-4xl">{CAREER_ICONS[analysis.predicted_career] || '🎯'}</span>
        <div>
          <p className="text-sm text-klenz-orange font-semibold">Predicted Career</p>
          <h2 className="text-xl font-semibold text-white">{analysis.predicted_career}</h2>
          <p className="text-sm text-klenz-muted">{score}% confidence</p>
        </div>
      </div>

      <div className="panel-elevated p-6 mb-8 border-l-4 border-klenz-teal">
        <h3 className="text-sm font-semibold text-klenz-teal mb-3">Your Career Narrative</h3>
        <p className="text-klenz-muted text-sm leading-relaxed">{analysis.narrative}</p>
      </div>

      <h3 className="text-sm font-semibold mb-4 text-klenz-muted uppercase tracking-wider">
        Confidence Scores
      </h3>
      <div className="grid md:grid-cols-2 gap-3 mb-8">
        {scores.map(([career, value], index) => {
          const pct = Math.round(value * 100);
          return (
            <div key={career} className="panel-elevated p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{career}</span>
                <span className="text-klenz-orange font-bold text-sm">{pct}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pct}%`, animationDelay: `${index * 100}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Link to="/dashboard/careers" className="btn-primary text-sm">
        View Career Matches →
      </Link>
    </div>
  );
}
