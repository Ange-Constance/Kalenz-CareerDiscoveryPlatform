import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CareersIcon,
  ChatIcon,
  RoadmapIcon,
  UploadIcon,
} from '../common/Icons';
import SidebarShell from './SidebarShell';

const navItems = [
  { path: '/upload', label: 'Upload', Icon: UploadIcon },
  { path: '/results', label: 'Results', Icon: CareersIcon },
  { path: '/roadmap', label: 'Roadmap', Icon: RoadmapIcon },
  { path: '/chat', label: 'Chat', Icon: ChatIcon },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarShell
      logoTo="/upload"
      navItems={navItems}
      onLogout={handleLogout}
      userLabel={user?.name || user?.email}
      mainScrollable={!isChatRoute}
    >
      {children}
    </SidebarShell>
  );
}
