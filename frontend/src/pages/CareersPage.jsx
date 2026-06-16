import { Link } from 'react-router-dom';
import { CAREER_DESCRIPTIONS, CAREER_NAMES } from '../data/careers';
import { CAREER_ICONS } from '../data/roadmapData';
import { getLastAnalysis } from '../utils/lastAnalysis';

function CareerCard({ career, score, isTop, index }) {
  const pct = Math.round(score * 100);

  return (
    <Link
      to="/dashboard/roadmap"
      className={`panel-elevated p-5 block transition-all hover:-translate-y-1 hover:border-klenz-border-orange ${
        isTop ? 'border-klenz-border-orange ring-1 ring-klenz-orange/20' : ''
      }`}
    >
      {isTop && <span className="badge-purple text-xs mb-3 inline-block">Top Match</span>}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{CAREER_ICONS[career] || '🎯'}</span>
          <h3 className="font-semibold text-sm">{career}</h3>
        </div>
        <span className="text-2xl font-bold text-gradient-purple">{pct}%</span>
      </div>
      <div className="progress-bar mb-4">
        <div
          className="progress-bar-fill"
          style={{ '--bar-width': `${pct}%`, width: `${pct}%`, animationDelay: `${index * 100}ms` }}
        />
      </div>
      <p className="text-klenz-muted text-sm leading-relaxed">
        {CAREER_DESCRIPTIONS[career] || 'Career path match based on your CV.'}
      </p>
    </Link>
  );
}

export default function CareersPage() {
  const analysis = getLastAnalysis();

  if (!analysis?.confidence_scores) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center page-enter">
        <h1 className="page-title mb-2">Career Matches</h1>
        <p className="page-subtitle mb-8 max-w-md">
          Upload and analyze your CV first to see ML-ranked career matches.
        </p>
        <Link to="/upload" className="btn-primary">
          Upload CV
        </Link>
      </div>
    );
  }

  const sorted = CAREER_NAMES.map((career) => ({
    career,
    score: analysis.confidence_scores[career] || 0,
  })).sort((a, b) => b.score - a.score);

  const topCareer = analysis.predicted_career || sorted[0]?.career;

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1.5">Career Matches</h1>
          <p className="page-subtitle">Ranked by probability based on your CV</p>
        </div>
        <Link to="/dashboard/roadmap" className="btn-secondary text-sm self-start">
          View Roadmap →
        </Link>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {sorted.map(({ career, score }, index) => (
          <CareerCard
            key={career}
            career={career}
            score={score}
            isTop={career === topCareer}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
