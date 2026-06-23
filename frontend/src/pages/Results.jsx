import { useEffect, useMemo, useState } from "react";
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

const ALL_CAREERS = [
  "Backend Development",
  "Frontend Development",
  "AI/ML Development",
  "UI/UX Design",
  "DevOps/Cloud",
  "Data Engineering",
  "Cybersecurity",
  "Mobile Development",
  "Product/Project Management",
];

const ORANGE = "#FF8C00";
const MUTED_BAR = "#1a1a24";
const TEAL = "#1D9E75";
const AMBER = "#f59e0b";

const MODEL_ROWS = [
  { model: "TF-IDF + Logistic Regression", accuracy: "89.21%", f1: "0.89", classes: "5", notes: "Fast baseline", current: false },
  { model: "DistilBERT v1", accuracy: "87.81%", f1: "0.88", classes: "8", notes: "First BERT model", current: false },
  { model: "DistilBERT v2", accuracy: "85.98%", f1: "0.86", classes: "9", notes: "Added Backend/Frontend", current: false },
  { model: "DistilBERT v3 (current)", accuracy: "86.49%", f1: "0.87", classes: "9", notes: "Balanced + optimized", current: true },
];

function capitalizeWord(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function FeatureBar({ word, weight, maxWeight, fillColor, labelColor, animate }) {
  const pct = (weight * 100).toFixed(1);
  const barWidth = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-sm font-medium w-16 shrink-0"
        style={{ fontFamily: "Poppins", color: labelColor }}
      >
        {capitalizeWord(word)}
      </span>
      <div
        className="flex-1 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 8 }}
      >
        <div
          className="transition-all duration-700 ease-out"
          style={{
            width: animate ? `${barWidth}%` : "0%",
            backgroundColor: fillColor,
            borderRadius: 4,
            height: 8,
          }}
        />
      </div>
      <span className="text-xs text-klenz-muted tabular-nums w-12 text-right shrink-0">
        {pct}%
      </span>
    </div>
  );
}

function LimeExplanation({ explanation }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const supporting = useMemo(
    () =>
      [...(explanation.supporting_words || [])]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 6),
    [explanation.supporting_words]
  );

  const contradicting = useMemo(
    () =>
      [...(explanation.contradicting_words || [])]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 6),
    [explanation.contradicting_words]
  );

  const maxSupporting = supporting.length
    ? Math.max(...supporting.map((w) => w.weight))
    : 1;
  const maxContradicting = contradicting.length
    ? Math.max(...contradicting.map((w) => w.weight))
    : 1;

  const predictedCareer = explanation.predicted_career || "this career";

  return (
    <div className="panel p-6">
      <h2 className="text-lg font-semibold text-white mb-1">
        Why {predictedCareer}?
      </h2>
      <p className="text-sm text-klenz-muted mb-6">
        Key signals from your profile that influenced this prediction
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: TEAL }}>
            ✅ Supporting Signals
          </h3>
          <div className="space-y-4">
            {supporting.length > 0 ? (
              supporting.map((item) => (
                <FeatureBar
                  key={item.word}
                  word={item.word}
                  weight={item.weight}
                  maxWeight={maxSupporting}
                  fillColor={TEAL}
                  labelColor="#ffffff"
                  animate={animate}
                />
              ))
            ) : (
              <p className="text-sm text-klenz-muted">No supporting signals found.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4" style={{ color: AMBER }}>
            ⚠️ Contradicting Signals
          </h3>
          {contradicting.length > 0 ? (
            <div className="space-y-4">
              {contradicting.map((item) => (
                <FeatureBar
                  key={item.word}
                  word={item.word}
                  weight={item.weight}
                  maxWeight={maxContradicting}
                  fillColor={AMBER}
                  labelColor={AMBER}
                  animate={animate}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-klenz-muted">No contradicting signals found ✅</p>
          )}
        </div>
      </div>

      <p className="text-xs text-klenz-muted mt-6">
        Powered by LIME (Local Interpretable Model-agnostic Explanations)
      </p>
    </div>
  );
}

function ModelPerformanceSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="panel overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-lg font-semibold">📊 Model Performance</span>
        <span
          className="text-klenz-muted transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-white mb-4">How we chose our model</h3>
          <div className="overflow-x-auto rounded-lg" style={{ background: "#111118" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-klenz-muted text-xs">
                  <th className="text-left p-3 font-medium">Model</th>
                  <th className="text-left p-3 font-medium">Accuracy</th>
                  <th className="text-left p-3 font-medium">F1 Score</th>
                  <th className="text-left p-3 font-medium">Classes</th>
                  <th className="text-left p-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_ROWS.map((row, i) => (
                  <tr
                    key={row.model}
                    className={
                      row.current
                        ? "border border-[#534AB7]"
                        : i % 2 === 0
                          ? "bg-white/[0.02]"
                          : "bg-transparent"
                    }
                  >
                    <td className="p-3 text-white">
                      {row.model}
                      {row.current && <span className="ml-1 text-klenz-teal">✅</span>}
                    </td>
                    <td className="p-3 text-klenz-muted">{row.accuracy}</td>
                    <td className="p-3 text-klenz-muted">{row.f1}</td>
                    <td className="p-3 text-klenz-muted">{row.classes}</td>
                    <td className="p-3 text-klenz-muted">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-klenz-muted mt-4 leading-relaxed">
            Current model: DistilBERT (distilbert-base-uncased) fine-tuned on 5,541 samples
            across 9 career classes
          </p>
        </div>
      )}
    </div>
  );
}

function formatSourceLabel(source) {
  if (source === "cv") return "CV";
  if (source === "github") return "GitHub";
  if (source === "certificate") return "Certificate";
  return source;
}

function formatSources(sources) {
  if (!sources?.length) return "CV";
  return sources.map(formatSourceLabel).join(" + ");
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const analysis = useMemo(() => {
    if (location.state?.analysis) return location.state.analysis;
    return getLastAnalysis();
  }, [location.state]);

  const chartData = useMemo(() => {
    const scores = analysis?.confidence_scores || {};
    return ALL_CAREERS.map((career) => ({
      career: career.length > 22 ? `${career.slice(0, 20)}…` : career,
      fullCareer: career,
      score: Math.round((scores[career] || 0) * 100),
    })).sort((a, b) => b.score - a.score);
  }, [analysis]);

  if (!analysis) {
    return (
      <AppLayout>
        <div className="text-center py-20 page-enter">
          <h1 className="text-2xl font-bold mb-4">No Results Yet</h1>
          <p className="text-klenz-muted mb-6">
            Upload your profile to get career predictions.
          </p>
          <Link to="/upload" className="btn-primary">
            Analyze Profile
          </Link>
        </div>
      </AppLayout>
    );
  }

  const topScore =
    analysis.confidence_pct ??
    Math.round((analysis.confidence_scores?.[analysis.predicted_career] || 0) * 100);

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
          {analysis.input_sources?.length > 0 && (
            <p className="text-xs text-klenz-muted mt-3">
              Analyzed from:{" "}
              <span className="text-white">{formatSources(analysis.input_sources)}</span>
            </p>
          )}
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-semibold mb-6">Career Confidence Scores</h2>
          <div className="overflow-x-auto -mx-2 px-2">
            <ResponsiveContainer width="100%" height={chartData.length * 48 + 20} minWidth={320}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#a0a0b8", fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="career"
                  width={150}
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
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.fullCareer}
                      fill={
                        entry.fullCareer === analysis.predicted_career ? ORANGE : MUTED_BAR
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {analysis.explanation && (
          <LimeExplanation explanation={analysis.explanation} />
        )}

        {analysis.key_skills?.length > 0 && (
          <div className="panel p-6">
            <h2 className="text-sm font-semibold text-[#534AB7] mb-3 uppercase tracking-wider">
              Key Skills Extracted
            </h2>
            <div className="flex flex-wrap gap-2">
              {analysis.key_skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-3 py-1 rounded-full bg-[#534AB7]/15 text-[#c4bfe8] border border-[#534AB7]/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="panel p-6 border-l-4 border-klenz-teal">
          <h2 className="text-sm font-semibold text-klenz-teal mb-3 uppercase tracking-wider">
            AI Career Narrative
          </h2>
          <p className="text-klenz-muted leading-relaxed text-sm">{analysis.narrative}</p>
        </div>

        <ModelPerformanceSection />

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <button
            type="button"
            onClick={() =>
              navigate("/roadmap", { state: { analysis } })
            }
            className="btn-primary"
          >
            Roadmap
          </button>
          <button
            type="button"
            onClick={() =>
              navigate("/chat", { state: { analysis } })
            }
            className="btn-secondary"
          >
            Chat
          </button>
          <Link to="/upload" className="btn-outline text-center">
            Upload Another
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
