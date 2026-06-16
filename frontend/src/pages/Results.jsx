import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppLayout from "../components/Layout/AppLayout";
import { CAREER_ICONS } from "../data/roadmapData";
import { getLastAnalysis } from "../utils/lastAnalysis";

const ORANGE = "#FF8C00";
const MUTED_BAR = "#1a1a24";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const analysis = useMemo(() => {
    if (location.state?.analysis) return location.state.analysis;
    return getLastAnalysis();
  }, [location.state]);

  const chartData = useMemo(() => {
    if (!analysis?.confidence_scores) return [];
    return Object.entries(analysis.confidence_scores)
      .map(([career, score]) => ({
        career: career.length > 20 ? career.slice(0, 18) + "…" : career,
        fullCareer: career,
        score: Math.round(score * 100),
      }))
      .sort((a, b) => b.score - a.score);
  }, [analysis]);

  if (!analysis) {
    return (
      <AppLayout>
        <div className="text-center py-20 page-enter">
          <h1 className="text-2xl font-bold mb-4">No Results Yet</h1>
          <p className="text-klenz-muted mb-6">
            Upload your CV to get career predictions.
          </p>
          <Link to="/upload" className="btn-primary">
            Upload CV
          </Link>
        </div>
      </AppLayout>
    );
  }

  const topScore = Math.round(
    (analysis.confidence_scores?.[analysis.predicted_career] || 0) * 100,
  );

  return (
    <AppLayout>
      <div className="w-full space-y-8 page-enter">
        <div className="text-center panel-orange p-8">
          <div className="text-5xl mb-4">
            {CAREER_ICONS[analysis.predicted_career] || "🎯"}
          </div>
          <p className="text-sm text-klenz-orange font-semibold uppercase tracking-wider mb-2">
            Your Best Match
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {analysis.predicted_career}
          </h1>
          <p className="text-klenz-muted text-sm">{topScore}% confidence match</p>
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-semibold mb-6">Career Confidence Scores</h2>
          <div className="overflow-x-auto -mx-2 px-2">
            <ResponsiveContainer width="100%" height={chartData.length * 48 + 20} minWidth={320}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#a0a0b8", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="career"
                  width={140}
                  tick={{ fill: "#ffffff", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111118",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  formatter={(v) => [`${v}%`, "Confidence"]}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20} isAnimationActive animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.fullCareer}
                      fill={
                        entry.fullCareer === analysis.predicted_career
                          ? ORANGE
                          : MUTED_BAR
                      }
                      style={{ animationDelay: `${index * 100}ms` }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6 border-l-4 border-klenz-teal">
          <h2 className="text-sm font-semibold text-klenz-teal mb-3 uppercase tracking-wider">
            AI Career Narrative
          </h2>
          <p className="text-klenz-muted leading-relaxed text-sm">
            {analysis.narrative}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() =>
              navigate("/roadmap", {
                state: { career: analysis.predicted_career },
              })
            }
            className="btn-primary"
          >
            Explore Roadmap
          </button>
          <Link to="/upload" className="btn-outline text-center">
            Upload Another CV
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
