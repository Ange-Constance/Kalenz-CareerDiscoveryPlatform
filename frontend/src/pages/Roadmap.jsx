import { Link, useLocation } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { CAREER_ICONS, ROADMAPS } from "../data/roadmapData";
import { getLastAnalysis } from "../utils/lastAnalysis";

export default function Roadmap() {
  const location = useLocation();

  const career = location.state?.career || getLastAnalysis()?.predicted_career || null;

  const roadmap = career ? ROADMAPS[career] : null;

  if (!career || !roadmap) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="page-title mb-4">No Roadmap Available</h1>
          <p className="page-subtitle mb-6">
            Complete a CV analysis first to see your learning roadmap.
          </p>
          <Link to="/upload" className="btn-primary">
            Upload CV
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full page-enter">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl">{CAREER_ICONS[career] || "🗺️"}</span>
          <div>
            <p className="text-sm text-klenz-orange font-semibold uppercase tracking-wider">
              Learning Roadmap
            </p>
            <h1 className="page-title">{career}</h1>
          </div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-klenz-orange via-klenz-orange-dark to-klenz-orange/30 hidden sm:block" />

          <div className="space-y-8">
            {roadmap.phases.map((phase, i) => (
              <div
                key={phase.title}
                className="relative sm:pl-12 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="hidden sm:flex absolute left-3 top-6 w-4 h-4 rounded-full bg-klenz-orange border-2 border-klenz-black shadow-lg shadow-klenz-orange/30" />

                <div className="panel p-6 hover:border-klenz-border-orange transition-colors">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {phase.title}
                  </h2>
                  <p className="text-sm text-klenz-muted mb-4">
                    {phase.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-klenz-orange uppercase tracking-wider mb-2">
                      Skills & Tools
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-3 py-1 rounded-full bg-klenz-orange/10 text-klenz-orange border border-klenz-orange/20"
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

        <div className="mt-10 flex gap-4 justify-center">
          <Link to="/chat" className="btn-primary">
            Ask Career Assistant
          </Link>
          <Link to="/results" className="btn-ghost">
            View Results
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
