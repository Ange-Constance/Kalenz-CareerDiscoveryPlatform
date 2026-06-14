import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AppLayout from '../components/Layout/AppLayout';
import { CAREER_ICONS } from '../data/roadmapData';

const PURPLE = '#534AB7';
const TEAL = '#1D9E75';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const analysis = useMemo(() => {
    if (location.state?.analysis) return location.state.analysis;
    const saved = localStorage.getItem('lastAnalysis');
    return saved ? JSON.parse(saved) : null;
  }, [location.state]);

  const chartData = useMemo(() => {
    if (!analysis?.confidence_scores) return [];
    return Object.entries(analysis.confidence_scores)
      .map(([career, score]) => ({
        career: career.length > 20 ? career.slice(0, 18) + '…' : career,
        fullCareer: career,
        score: Math.round(score * 100),
      }))
      .sort((a, b) => b.score - a.score);
  }, [analysis]);

  if (!analysis) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">No Results Yet</h1>
          <p className="text-klenz-muted mb-6">Upload your CV to get career predictions.</p>
          <Link to="/upload" className="btn-purple">Upload CV</Link>
        </div>
      </AppLayout>
    );
  }

  const topScore = Math.round((analysis.confidence_scores?.[analysis.predicted_career] || 0) * 100);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Predicted career hero */}
        <div className="text-center panel p-8 border-klenz-purple/30">
          <div className="text-5xl mb-4">{CAREER_ICONS[analysis.predicted_career] || '🎯'}</div>
          <p className="text-sm text-klenz-teal font-semibold uppercase tracking-wider mb-2">Your Best Match</p>
          <h1 className="text-3xl md:text-4xl font-bold text-klenz-purple mb-2">{analysis.predicted_career}</h1>
          <p className="text-klenz-muted">{topScore}% confidence match</p>
        </div>

        {/* Confidence bar chart */}
        <div className="panel p-6">
          <h2 className="text-lg font-semibold mb-6">Career Confidence Scores</h2>
          <ResponsiveContainer width="100%" height={chartData.length * 48 + 20}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis type="category" dataKey="career" width={140} tick={{ fill: '#ccc', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8 }}
                formatter={(v) => [`${v}%`, 'Confidence']}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.fullCareer}
                    fill={entry.fullCareer === analysis.predicted_career ? PURPLE : TEAL}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI narrative */}
        <div className="panel p-6 border-l-4 border-klenz-purple">
          <h2 className="text-sm font-semibold text-klenz-purple mb-3 uppercase tracking-wider">AI Career Narrative</h2>
          <p className="text-klenz-muted leading-relaxed text-sm">{analysis.narrative}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/roadmap', { state: { career: analysis.predicted_career } })}
            className="btn-purple"
          >
            Explore Roadmap
          </button>
          <Link to="/upload" className="btn-teal text-center">Upload Another CV</Link>
        </div>
      </div>
    </AppLayout>
  );
}
