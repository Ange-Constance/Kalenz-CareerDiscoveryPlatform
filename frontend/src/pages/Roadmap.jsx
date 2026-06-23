import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { CAREER_ICONS } from "../data/roadmapData";
import { generateRoadmap } from "../services/api";
import { getLastAnalysis, setLastAnalysis } from "../utils/lastAnalysis";

export default function Roadmap() {
  const location = useLocation();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analysis = useMemo(
    () => location.state?.analysis || getLastAnalysis(),
    [location.state]
  );

  const career = analysis?.predicted_career;
  const confidence =
    analysis?.confidence_pct ??
    Math.round((analysis?.confidence_scores?.[career] || 0) * 100);

  useEffect(() => {
    if (!analysis || !career) return;

    if (analysis.roadmap) {
      setRoadmap(analysis.roadmap);
      return;
    }

    setLoading(true);
    setError("");

    generateRoadmap(
      analysis.id,
      career,
      analysis.narrative || "",
      confidence,
      analysis.key_skills || []
    )
      .then((result) => {
        if (!result.success) throw new Error(result.error || "Failed to generate roadmap");
        setRoadmap(result.data);
        const updated = { ...analysis, roadmap: result.data };
        setLastAnalysis(updated);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message || "Roadmap generation failed");
      })
      .finally(() => setLoading(false));
  }, [analysis, career, confidence]);

  if (!analysis || !career) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="page-title mb-4">No Roadmap Available</h1>
          <p className="page-subtitle mb-6">
            Complete a profile analysis first to see your learning roadmap.
          </p>
          <Link to="/upload" className="btn-primary">
            Analyze Profile
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 page-enter">
          <LoadingSpinner size="lg" />
          <p className="text-klenz-muted mt-4">🗺️ Generating your personalized roadmap...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !roadmap) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error || "Could not load roadmap"}</p>
          <Link to="/results" className="btn-primary">
            Back to Results
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full page-enter">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-4xl">{CAREER_ICONS[career] || "🗺️"}</span>
          <div>
            <p className="text-sm text-klenz-orange font-semibold uppercase tracking-wider">
              Learning Roadmap
            </p>
            <h1 className="page-title">{career}</h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-klenz-orange/10 text-klenz-orange border border-klenz-orange/20">
            {confidence}% match
          </span>
        </div>

        {roadmap.next_action && (
          <div className="panel p-5 mb-8 border-l-4 border-klenz-teal bg-klenz-teal/5">
            <p className="text-xs text-klenz-teal uppercase tracking-wider mb-1">
              Your next step this week
            </p>
            <p className="text-white font-medium">{roadmap.next_action}</p>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-klenz-orange via-klenz-orange-dark to-klenz-orange/30 hidden sm:block" />
          <div className="space-y-8">
            {(roadmap.phases || []).map((phase, i) => (
              <div key={phase.phase || phase.title} className="relative sm:pl-12 animate-slide-up">
                <div className="hidden sm:flex absolute left-3 top-6 w-4 h-4 rounded-full bg-klenz-orange border-2 border-klenz-black" />
                <div className="panel p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-klenz-orange">Phase {phase.phase || i + 1}</span>
                    <h2 className="text-lg font-semibold text-white">{phase.title}</h2>
                    {phase.duration && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-klenz-elevated text-klenz-muted">
                        {phase.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-klenz-muted mb-4">{phase.description}</p>

                  {phase.skills?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-klenz-teal uppercase tracking-wider mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {phase.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-3 py-1 rounded-full bg-klenz-teal/10 text-klenz-teal border border-klenz-teal/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.projects?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-klenz-orange uppercase tracking-wider mb-2">
                        Projects
                      </p>
                      <ol className="list-decimal list-inside text-sm text-klenz-muted space-y-1">
                        {phase.projects.map((project) => (
                          <li key={project}>{project}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {phase.resources?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-klenz-muted uppercase tracking-wider mb-2">
                        Resources
                      </p>
                      <ul className="space-y-1">
                        {phase.resources.map((r) => (
                          <li key={r.url || r.title}>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-klenz-teal hover:underline"
                            >
                              {r.title} →
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {phase.milestone && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-klenz-elevated border border-klenz-border text-sm">
                      <span className="text-klenz-orange font-semibold">Milestone: </span>
                      <span className="text-klenz-muted">{phase.milestone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {roadmap.rwanda_opportunities?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold mb-4">Rwanda Opportunities</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {roadmap.rwanda_opportunities.map((item) => (
                <div
                  key={item}
                  className="panel p-4 border-l-4 border-[#534AB7] text-sm text-klenz-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        {roadmap.certifications?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Recommended Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {roadmap.certifications.map((cert) => (
                <span
                  key={cert}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#534AB7]/15 text-[#c4bfe8] border border-[#534AB7]/30"
                >
                  {cert}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex gap-4 justify-center flex-wrap">
          <Link to="/chat" state={{ analysis }} className="btn-primary">
            Ask Career Assistant
          </Link>
          <Link to="/results" state={{ analysis }} className="btn-ghost">
            View Results
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
