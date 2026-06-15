import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: '/upload', label: 'Upload' },
    { to: '/results', label: 'Results' },
    { to: '/roadmap', label: 'Roadmap' },
    { to: '/chat', label: 'Chat' },
  ];

  return (
    <div className="min-h-screen bg-klenz-black font-sans">
      <header className="border-b border-klenz-border bg-klenz-card/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo to="/" />
          <nav className="hidden sm:flex items-center gap-1">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 text-sm text-klenz-muted hover:text-white rounded-lg hover:bg-klenz-elevated transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-klenz-muted hidden md:inline">{user?.name || user?.email}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="btn-ghost text-xs py-2 px-3">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
