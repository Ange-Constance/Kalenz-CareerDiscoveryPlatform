export function SettingsIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="3" />
      <path
        d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChatIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <path
        d="M8 10h8M8 14h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6h14a2 2 0 012 2v7a2 2 0 01-2 2h-3.5l-3.5 3v-3H5a2 2 0 01-2-2V8a2 2 0 012-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CareersIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <path
        d="M8 6h8a2 2 0 012 2v10H6V8a2 2 0 012-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12h12M10 6V4a1 1 0 011-1h2a1 1 0 011 1v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfileIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RoadmapIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <path
        d="M5 6h3l2 10 4-14 2 8h3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UploadIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <path
        d="M12 16V4M12 4L8 8M12 4L16 8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V16"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HistoryIcon({ className = "w-5 h-5", active = false }) {
  const color = active ? "#FF8C00" : "currentColor";
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function ChevronDown({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF8C00"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

export function LargeUploadIcon({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="1.5"
    >
      <path
        d="M32 44V16M32 16L22 26M32 16L42 26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 44V48C12 50.2 13.8 52 16 52H48C50.2 52 52 50.2 52 48V44"
        strokeLinecap="round"
      />
    </svg>
  );
}
