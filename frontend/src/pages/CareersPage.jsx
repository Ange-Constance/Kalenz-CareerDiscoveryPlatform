import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TAGS = {
  "UX Research": ["remote-friendly", "high-growth", "creative"],
  "Health Data": ["impact-driven", "high-demand", "analytical"],
  Policy: ["research-focused", "government", "strategic"],
  Backend: ["high-demand", "remote-friendly", "technical"],
  DevOps: ["high-growth", "cloud", "automation"],
};

function CareerCard({
  career,
  probability,
  description,
  isTop,
  isSelected,
  onSelect,
}) {
  const pct = Math.round(probability * 100);

  return (
    <div
      onClick={() => onSelect(career)}
      className={`panel-elevated p-5 cursor-pointer transition-all hover:border-klenz-orange/30 ${
        isSelected ? "border-klenz-orange ring-1 ring-klenz-orange/30" : ""
      } ${isTop ? "border-klenz-orange/20" : ""}`}
    >
      {isTop && <span className="badge-orange text-xs mb-3">Top Match</span>}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">{career}</h3>
        <span className="text-2xl font-bold text-gradient-orange">{pct}%</span>
      </div>
      <div className="w-full bg-klenz-border rounded-full h-1.5 mb-4">
        <div
          className="bg-orange-gradient h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-klenz-muted text-sm mb-3 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {(TAGS[career] || []).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-klenz-card text-klenz-muted px-2.5 py-1 rounded-full border border-klenz-border"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CareersPage() {
  const [matches, setMatches] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("latestAnalysis");
    if (saved) {
      const analysis = JSON.parse(saved);
      setMatches(analysis.career_matches || []);
      if (analysis.career_matches?.[0]) {
        setSelectedCareer(analysis.career_matches[0].career);
        localStorage.setItem(
          "selectedCareer",
          analysis.career_matches[0].career,
        );
      }
    }
  }, []);

  const handleSelect = (career) => {
    setSelectedCareer(career);
    localStorage.setItem("selectedCareer", career);
  };

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="page-title mb-2">Career Matches</h1>
        <p className="page-subtitle mb-8 max-w-md">
          Complete your talent profile first to see ML-ranked career matches.
        </p>
        <Link to="/dashboard/profile" className="btn-orange">
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1.5">Career Matches</h1>
          <p className="page-subtitle">
            Ranked by probability based on your evidence
          </p>
        </div>
        {selectedCareer && (
          <Link
            to="/dashboard/roadmap"
            className="btn-orange text-sm self-start"
          >
            View Roadmap →
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {matches.map((match, i) => (
          <CareerCard
            key={match.career}
            career={match.career}
            probability={match.probability}
            description={match.description}
            isTop={i === 0}
            isSelected={selectedCareer === match.career}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
