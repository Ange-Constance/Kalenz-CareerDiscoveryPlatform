import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppLayout from "../components/Layout/AppLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { CAREER_ICONS } from "../data/roadmapData";
import { getAnalysisHistory } from "../services/api";
import { getAnalysisHistoryLocal } from "../utils/lastAnalysis";

function formatSourceLabel(source) {
  if (source === "cv") return "CV";
  if (source === "github") return "GitHub";
  if (source === "certificate") return "Certificate";
  return source;
}

export default function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalysisHistory()
      .then((result) => {
        setAnalyses(result.data || []);
      })
      .catch(() => {
        setAnalyses(getAnalysisHistoryLocal());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!analyses.length) {
    return (
      <AppLayout>
        <div className="text-center py-20 page-enter">
          <h1 className="page-title mb-4">Your Career Journey</h1>
          <p className="text-klenz-muted mb-6">
            No analyses yet. Upload your CV to get started →
          </p>
          <Link to="/upload" className="btn-primary">
            Analyze Profile
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full page-enter">
        <h1 className="page-title mb-2">Your Career Journey</h1>
        <p className="page-subtitle mb-8">
          {analyses.length} past {analyses.length === 1 ? "analysis" : "analyses"}
        </p>

        <div className="space-y-4">
          {analyses.map((item) => {
            const preview =
              item.narrative_preview ||
              (item.narrative?.length > 200
                ? `${item.narrative.slice(0, 200)}…`
                : item.narrative);

            return (
              <article key={item.id} className="panel p-6 hover:border-klenz-border-orange transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {CAREER_ICONS[item.predicted_career] || "🎯"}
                    </span>
                    <div>
                      <h2 className="text-white font-semibold">{item.predicted_career}</h2>
                      <p className="text-xs text-klenz-muted">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        · {item.confidence_pct}% confidence
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(item.input_sources || ["cv"]).map((src) => (
                      <span
                        key={src}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-klenz-elevated text-klenz-muted border border-klenz-border"
                      >
                        {formatSourceLabel(src)}
                      </span>
                    ))}
                  </div>
                </div>

                {preview && (
                  <p className="text-sm text-klenz-muted mb-4 line-clamp-2">{preview}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/results", { state: { analysis: item } })}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    View Results
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/roadmap", { state: { analysis: item } })}
                    className="btn-outline text-sm py-2 px-4"
                  >
                    Open Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/chat", { state: { analysis: item } })}
                    className="btn-ghost text-sm py-2 px-4"
                  >
                    Continue Chat
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
