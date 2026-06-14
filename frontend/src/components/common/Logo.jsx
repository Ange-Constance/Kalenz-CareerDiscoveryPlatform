import { Link } from 'react-router-dom';

export function LogoIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#FF7A00" />
      <circle cx="16" cy="16" r="8" fill="#000" opacity="0.3" />
      <circle cx="16" cy="16" r="4" fill="#fff" />
      <circle cx="16" cy="16" r="2" fill="#FF7A00" />
    </svg>
  );
}

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon />
      <span className="text-xl font-bold text-white tracking-tight">KaLenz</span>
    </Link>
  );
}
