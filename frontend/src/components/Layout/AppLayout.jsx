import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CareersIcon,
  ChatIcon,
  HistoryIcon,
  RoadmapIcon,
  UploadIcon,
} from '../common/Icons';
import SidebarShell from './SidebarShell';

function ShieldIcon({ active, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"
        className={active ? 'stroke-klenz-orange' : 'stroke-current'}
      />
    </svg>
  );
}

export default function AppLayout({ children, adminMode = false, sidebarNavItems = null }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat';

  const defaultNavItems = useMemo(() => {
    const items = [
      { path: '/upload', label: 'Upload', Icon: UploadIcon },
      { path: '/results', label: 'Results', Icon: CareersIcon },
      { path: '/roadmap', label: 'Roadmap', Icon: RoadmapIcon },
      { path: '/chat', label: 'Chat', Icon: ChatIcon },
      { path: '/history', label: 'History', Icon: HistoryIcon },
    ];
    if (user?.is_admin) {
      items.push({ path: '/admin', label: 'Admin', Icon: ShieldIcon });
    }
    return items;
  }, [user?.is_admin]);

  const navItems = sidebarNavItems ?? defaultNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarShell
      logoTo={adminMode ? '/admin' : '/upload'}
      navItems={navItems}
      onLogout={handleLogout}
      userLabel={user?.name || user?.email}
      userInitials={initials}
      userMenuLinks={
        adminMode
          ? [{ label: 'Back to App', to: '/upload' }]
          : [
              { label: 'Profile', to: '/dashboard/profile' },
              { label: 'History', to: '/history' },
            ]
      }
      mainScrollable={!isChatRoute}
    >
      {children}
    </SidebarShell>
  );
}
