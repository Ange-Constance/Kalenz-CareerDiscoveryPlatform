import { useState, useEffect } from 'react';
import { roadmapAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';

function TimelineItem({ item, index, isLast }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="relative pl-8 pb-6 animate-slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="absolute left-0 top-1 w-3 h-3 bg-klenz-orange rounded-full" />
      {!isLast && <div className="absolute left-[5px] top-4 w-px h-full bg-klenz-border" />}

      <div
        className="panel-elevated p-4 cursor-pointer hover:border-klenz-orange/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-klenz-orange">Week {item.week}</span>
          <span className="text-xs text-green-400 font-medium">+{item.impact}% impact</span>
        </div>
        <h4 className="font-medium text-sm">{item.title}</h4>
        {expanded && (
          <p className="text-klenz-muted text-xs mt-2 leading-relaxed animate-fade-in">{item.description}</p>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const careerName = localStorage.getItem('selectedCareer') || 'Backend';

  useEffect(() => {
    roadmapAPI
      .get(careerName)
      .then(({ data }) => setRoadmap(data))
      .catch(() => setRoadmap(null))
      .finally(() => setLoading(false));
  }, [careerName]);

  const handleDownload = async () => {
    try {
      const { data } = await roadmapAPI.download(careerName);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `roadmap-${careerName.replace(/\s+/g, '-')}.txt`;
      a.click();
      setToast({ message: 'Roadmap downloaded!', type: 'success' });
    } catch {
      setToast({ message: 'Download failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Roadmap</h1>
        <p className="text-klenz-muted text-sm">Select a career from the Careers page first.</p>
      </div>
    );
  }

  const gap = roadmap.target_fit - roadmap.current_fit;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Roadmap — {careerName}</h1>
          <p className="text-sm text-klenz-muted">Your 8-week path to bridge the gap</p>
        </div>
        <button onClick={handleDownload} className="btn-dark text-sm self-start">
          Download Roadmap
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Current Fit', value: `${roadmap.current_fit}%` },
          { label: 'Target Fit', value: `${roadmap.target_fit}%` },
          { label: 'Timeline', value: '8 weeks' },
          { label: 'Gap', value: `${gap}%` },
        ].map((stat) => (
          <div key={stat.label} className="panel-elevated p-4 text-center">
            <p className="text-xs text-klenz-muted mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-gradient-orange">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="panel-elevated p-5 mb-8">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-klenz-muted">Progress to target</span>
          <span className="text-klenz-orange font-medium">{roadmap.current_fit}%</span>
        </div>
        <div className="w-full bg-klenz-border rounded-full h-2">
          <div
            className="bg-orange-gradient h-2 rounded-full transition-all"
            style={{ width: `${roadmap.current_fit}%` }}
          />
        </div>
      </div>

      <h3 className="text-xs font-semibold text-klenz-muted uppercase tracking-wider mb-4">Timeline</h3>
      <div className="mb-8">
        {roadmap.timeline.map((item, i) => (
          <TimelineItem
            key={item.week}
            item={item}
            index={i}
            isLast={i === roadmap.timeline.length - 1}
          />
        ))}
      </div>

      <h3 className="text-xs font-semibold text-klenz-muted uppercase tracking-wider mb-4">Opportunities</h3>
      <div className="grid md:grid-cols-3 gap-3">
        {roadmap.opportunities.map((opp) => (
          <div key={opp.name} className="panel-elevated p-5 hover:border-klenz-orange/20 transition-colors">
            <h4 className="font-medium text-sm mb-2">{opp.name}</h4>
            <p className="text-klenz-muted text-xs mb-3 leading-relaxed">{opp.description}</p>
            <a
              href={opp.link}
              target="_blank"
              rel="noreferrer"
              className="text-klenz-orange text-xs font-semibold hover:underline"
            >
              Learn More →
            </a>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
