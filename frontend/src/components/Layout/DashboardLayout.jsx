import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import { UploadIcon, ChevronRight } from '../common/Icons';
import ChatSidebar from '../Chat/ChatSidebar';

const navItems = [
  { path: '/dashboard/upload', label: 'Upload Files' },
  { path: '/dashboard/careers', label: 'Careers' },
  { path: '/dashboard/profile', label: 'Profile' },
  { path: '/dashboard/roadmap', label: 'Roadmap' },
];

export default function DashboardLayout() {
  const { logout } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-klenz-black p-4 md:p-6">
      {/* Top bar */}
      <header className="panel-elevated px-6 py-4 mb-4 flex items-center justify-between">
        <Logo to="/dashboard/upload" />
        <button onClick={logout} className="btn-ghost text-sm py-2 px-5">
          Logout
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <aside className="panel w-full lg:w-64 shrink-0 p-3">
          <nav className="space-y-1">
            {navItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-klenz-elevated border border-klenz-border text-white'
                      : 'text-klenz-muted hover:text-white hover:bg-klenz-elevated/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <UploadIcon active={isActive} className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium flex-1">{label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-klenz-muted" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="panel flex-1 p-6 md:p-8 min-h-[calc(100vh-120px)]">
          <Outlet />
        </main>
      </div>

      {/* Floating chat */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-gradient rounded-full shadow-lg shadow-klenz-orange/30 flex items-center justify-center text-2xl hover:scale-105 transition-transform z-40"
        aria-label="Toggle chat"
      >
        💬
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[480px] panel z-50 flex flex-col shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-klenz-border">
            <span className="font-semibold text-sm">Career Assistant</span>
            <button onClick={() => setChatOpen(false)} className="text-klenz-muted hover:text-white text-lg">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
