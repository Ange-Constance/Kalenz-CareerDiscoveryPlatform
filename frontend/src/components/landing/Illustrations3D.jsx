const CAREERS = [
  { name: 'Software Development', pct: 45, highlight: true },
  { name: 'Data & AI', pct: 28 },
  { name: 'Cybersecurity', pct: 12 },
  { name: 'Product Mgmt', pct: 10 },
  { name: 'UI/UX Design', pct: 5 },
];

const COMPETENCIES = [
  { label: 'Systems', value: 78 },
  { label: 'Communication', value: 85 },
  { label: 'Empathy', value: 62 },
  { label: 'Data', value: 71 },
  { label: 'Analysis', value: 68 },
  { label: 'Collaboration', value: 80 },
];

/** Hero: branching career discovery path */
export function CareerPathHero({ className = '' }) {
  return (
    <div className={`career-path-scene illustration-float ${className}`}>
      <svg viewBox="0 0 320 300" className="career-path-svg" fill="none">
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFB347" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Path lines from center to careers */}
        <path d="M160 240 L160 180" stroke="url(#pathGrad)" strokeWidth="2" />
        <path d="M160 180 L60 100" stroke="#333" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M160 180 L110 80" stroke="#333" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M160 180 L160 70" stroke="url(#pathGrad)" strokeWidth="2.5" />
        <path d="M160 180 L210 80" stroke="#333" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M160 180 L260 100" stroke="#333" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Career nodes */}
        {[
          { x: 60, y: 100, label: 'UI/UX', pct: '5%' },
          { x: 110, y: 80, label: 'Product', pct: '10%' },
          { x: 160, y: 70, label: 'Software', pct: '45%', active: true },
          { x: 210, y: 80, label: 'Cyber', pct: '12%' },
          { x: 260, y: 100, label: 'Data/AI', pct: '28%' },
        ].map(({ x, y, label, pct, active }) => (
          <g key={label}>
            <circle
              cx={x} cy={y} r={active ? 28 : 22}
              fill={active ? '#FF7A00' : '#1a1a1a'}
              stroke={active ? '#FFB347' : '#444'}
              strokeWidth={active ? 2 : 1}
              filter={active ? 'url(#glow)' : undefined}
            />
            <text x={x} y={y - 4} textAnchor="middle" fill={active ? '#000' : '#fff'} fontSize="9" fontWeight="600">{label}</text>
            <text x={x} y={y + 8} textAnchor="middle" fill={active ? '#000' : '#FF7A00'} fontSize="8" fontWeight="700">{pct}</text>
          </g>
        ))}

        {/* You / evidence origin */}
        <circle cx="160" cy="240" r="24" fill="#111" stroke="#FF7A00" strokeWidth="2" />
        <text x="160" y="244" textAnchor="middle" fill="#FF7A00" fontSize="10" fontWeight="600">You</text>
        <text x="160" y="275" textAnchor="middle" fill="#666" fontSize="9">Your Evidence</text>
      </svg>
    </div>
  );
}

/** Feature: GitHub + Certificate + CV merging into signals */
export function EvidenceSources({ className = '' }) {
  return (
    <div className={`evidence-scene ${className}`}>
      <div className="evidence-beam" style={{ top: '80px', left: '80px', width: '60px', transform: 'rotate(-25deg)' }} />
      <div className="evidence-beam" style={{ top: '60px', left: '140px', width: '50px', transform: 'rotate(160deg)' }} />
      <div className="evidence-beam" style={{ top: '130px', left: '120px', width: '55px', transform: 'rotate(-10deg)' }} />

      <div className="evidence-card evidence-card-github">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF7A00">
          <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.021C22 6.484 17.522 2 12 2z" />
        </svg>
        <span className="text-[10px] text-klenz-muted font-medium">GitHub</span>
      </div>

      <div className="evidence-card evidence-card-cert">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
        <span className="text-[10px] text-klenz-muted font-medium">Certificate</span>
      </div>

      <div className="evidence-card evidence-card-cv">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="1.5">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
        <span className="text-[10px] text-klenz-muted font-medium">CV</span>
      </div>

      <div className="evidence-signal-core" title="Competency signals" />
    </div>
  );
}

/** Feature: 6 competency radar chart */
export function CompetencyRadar({ className = '' }) {
  const cx = 120;
  const cy = 120;
  const maxR = 80;
  const points = COMPETENCIES.map((c, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const r = (c.value / 100) * maxR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div className={`competency-scene illustration-float ${className}`}>
      <svg viewBox="0 0 240 240" className="competency-radar">
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFB347" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={COMPETENCIES.map((_, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const r = maxR * scale;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none"
            stroke="#333"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {COMPETENCIES.map((c, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const x2 = cx + maxR * Math.cos(angle);
          const y2 = cy + maxR * Math.sin(angle);
          const lx = cx + (maxR + 18) * Math.cos(angle);
          const ly = cy + (maxR + 18) * Math.sin(angle);
          return (
            <g key={c.label}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#333" strokeWidth="1" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="8">{c.label}</text>
            </g>
          );
        })}
        {/* Data polygon */}
        <polygon points={points} fill="url(#radarFill)" stroke="#FF7A00" strokeWidth="2" />
        {COMPETENCIES.map((c, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const r = (c.value / 100) * maxR;
          return (
            <circle key={c.label} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="4" fill="#FF7A00" />
          );
        })}
      </svg>
    </div>
  );
}

/** Feature: ranked career match bars */
export function CareerMatchBars({ className = '' }) {
  return (
    <div className={`match-scene illustration-float-delayed ${className}`}>
      <p className="text-[10px] text-klenz-muted uppercase tracking-wider mb-4 text-center">ML Career Matches</p>
      {CAREERS.map(({ name, pct, highlight }) => (
        <div key={name} className="match-bar-row">
          <span className="match-bar-label">{name}</span>
          <div className="match-bar-track">
            <div
              className="match-bar-fill"
              style={{ width: `${pct}%`, opacity: highlight ? 1 : 0.6 }}
            />
          </div>
          <span className="match-bar-pct">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

/** Roadmap: gap bridge + timeline weeks */
export function RoadmapTimeline({ className = '' }) {
  const weeks = [
    { label: '1-2', title: 'Foundations' },
    { label: '3-4', title: 'Build Skills' },
    { label: '5-6', title: 'Portfolio' },
    { label: '7-8', title: 'Apply' },
  ];

  return (
    <div className={`roadmap-scene illustration-float ${className}`}>
      <div className="roadmap-gap-visual">
        <div className="roadmap-fit-node">
          <div className="roadmap-fit-value">45%</div>
          <div className="roadmap-fit-label">Current</div>
        </div>
        <div className="roadmap-bridge" />
        <div className="roadmap-fit-node">
          <div className="roadmap-fit-value">85%</div>
          <div className="roadmap-fit-label">Target</div>
        </div>
      </div>
      <div className="roadmap-weeks">
        <div className="roadmap-week-line" />
        {weeks.map(({ label, title }) => (
          <div key={label} className="roadmap-week">
            <div className="roadmap-week-dot" />
            <div>
              <p className="text-[10px] text-klenz-teal font-semibold">Week {label}</p>
              <p className="text-xs text-white font-medium">{title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** FAQ decorative mini career path */
export function MiniCareerDiscovery({ className = '' }) {
  return (
    <div className={`scale-90 ${className}`}>
      <CareerPathHero />
    </div>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="hero-orb w-[500px] h-[500px] bg-klenz-orange/15 top-[-10%] right-[-5%] animate-pulse-glow" />
      <div className="hero-orb w-[400px] h-[400px] bg-klenz-teal/10 bottom-[20%] left-[-10%] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
    </div>
  );
}
