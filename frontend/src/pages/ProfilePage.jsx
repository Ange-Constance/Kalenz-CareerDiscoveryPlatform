import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { analysisAPI } from "../services/api";

const COMPETENCY_LABELS = {
  systems_thinking: "Systems Thinking",
  communication: "Communication",
  empathy: "Empathy for Users",
  data_analysis: "Data Analysis",
  analytical_depth: "Analytical Depth",
  collaboration: "Collaboration",
};

function CompetencyCard({ name, score, index }) {
  const pct = Math.round(score * 100);
  return (
    <div
      className="panel-elevated p-5 animate-slide-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-sm">{name}</h4>
        <span className="text-klenz-orange font-bold text-sm">{pct}%</span>
      </div>
      <div className="w-full bg-klenz-border rounded-full h-1.5">
        <div
          className="bg-orange-gradient h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await analysisAPI.run();
      setAnalysis(data);
      localStorage.setItem("latestAnalysis", JSON.stringify(data));
    } catch (err) {
      setError(
        err.response?.data?.error || "Analysis failed. Upload evidence first.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("latestAnalysis");
    if (saved) setAnalysis(JSON.parse(saved));
  }, []);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="page-title mb-2">Talent Profile</h1>
        <p className="page-subtitle mb-8 max-w-md">
          Run analysis on your uploaded evidence to generate your AI-powered
          talent profile.
        </p>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm max-w-md">
            {error}
          </div>
        )}
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="btn-orange flex items-center gap-2"
        >
          {loading && <LoadingSpinner size="sm" />}
          {loading ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>
    );
  }

  const competencies = analysis.competencies || {};

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1.5">Talent Profile</h1>
          <p className="page-subtitle">
            AI-generated narrative based on your evidence
          </p>
        </div>
        <Link to="/dashboard/careers" className="btn-orange text-sm self-start">
          View Careers →
        </Link>
      </div>

      <div className="panel-elevated p-6 mb-8 border-klenz-orange/10 animate-fade-in">
        <h3 className="text-sm font-semibold text-klenz-orange mb-3">
          Your Career Narrative
        </h3>
        <p className="text-klenz-muted text-sm leading-relaxed">
          {analysis.narrative}
        </p>
      </div>

      <h3 className="text-sm font-semibold mb-4 text-klenz-muted uppercase tracking-wider">
        Competency Signals
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(competencies).map(([key, score], i) => (
          <CompetencyCard
            key={key}
            name={COMPETENCY_LABELS[key] || key.replace(/_/g, " ")}
            score={score}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
