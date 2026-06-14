export function UploadIcon({ className = 'w-5 h-5', active = false }) {
  const color = active ? '#FF7A00' : 'currentColor';
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M12 16V4M12 4L8 8M12 4L16 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V16" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDown({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

export function LargeUploadIcon({ className = 'w-16 h-16' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="#888" strokeWidth="1.5">
      <path d="M32 44V16M32 16L22 26M32 16L42 26" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 44V48C12 50.2 13.8 52 16 52H48C50.2 52 52 50.2 52 48V44" strokeLinecap="round" />
    </svg>
  );
}
