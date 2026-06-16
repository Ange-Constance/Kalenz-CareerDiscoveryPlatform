import { Link } from 'react-router-dom';
import { CAREER_ICONS, ROADMAPS } from '../data/roadmapData';
import { getLastAnalysis } from '../utils/lastAnalysis';

export default function RoadmapPage() {
  const analysis = getLastAnalysis();
  const career = analysis?.predicted_career;
  const roadmap = career ? ROADMAPS[career] : null;

  if (!career || !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center page-enter">
        <h1 className="page-title mb-2">Roadmap</h1>
        <p className="page-subtitle mb-8">Upload and analyze your CV first to see your learning roadmap.</p>
        <Link to="/upload" className="btn-primary">
          Upload CV
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full page-enter">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">{CAREER_ICONS[career] || '🗺️'}</span>
        <div>
          <p className="text-sm text-klenz-orange font-semibold uppercase tracking-wider">
            Learning Roadmap
          </p>
          <h1 className="page-title">{career}</h1>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-klenz-orange via-klenz-orange-dark to-klenz-orange/30 hidden sm:block" />

        <div className="space-y-8">
          {roadmap.phases.map((phase, i) => (
            <div key={phase.title} className="relative sm:pl-12 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hidden sm:flex absolute left-3 top-6 w-4 h-4 rounded-full bg-klenz-orange border-2 border-klenz-black shadow-lg shadow-klenz-orange/30" />

              <div className="panel p-6 hover:border-klenz-border-orange transition-colors">
                <h2 className="text-lg font-semibold text-white mb-1">{phase.title}</h2>
                <p className="text-sm text-klenz-muted mb-4">{phase.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-klenz-orange uppercase tracking-wider mb-2">
                    Skills & Tools
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {phase.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-3 py-1 rounded-chip bg-klenz-orange/10 text-klenz-orange border border-klenz-border-orange"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-klenz-teal uppercase tracking-wider mb-2">
                    Free Resources
                  </p>
                  <ul className="space-y-1">
                    {phase.resources.map((r) => (
                      <li key={r.name}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-klenz-muted hover:text-klenz-teal hover:underline transition-colors"
                        >
                          {r.name} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/dashboard/chat" className="btn-primary">
          Ask Career Assistant
        </Link>
        <Link to="/results" className="btn-outline">
          View Results
        </Link>
      </div>
    </div>
  );
}
