import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  CareersIcon,
  ChatIcon,
  ProfileIcon,
  RoadmapIcon,
  SettingsIcon,
  UploadIcon,
} from "../common/Icons";
import SidebarShell from "./SidebarShell";

const navItems = [
  { path: "/dashboard/upload", label: "Upload Files", Icon: UploadIcon },
  { path: "/dashboard/careers", label: "Careers", Icon: CareersIcon },
  { path: "/dashboard/profile", label: "Profile", Icon: ProfileIcon },
  { path: "/dashboard/roadmap", label: "Roadmap", Icon: RoadmapIcon },
  { path: "/dashboard/chat", label: "Career Assistant", Icon: ChatIcon },
  { path: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatRoute = location.pathname.includes("/dashboard/chat");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarShell
      logoTo="/dashboard/upload"
      navItems={navItems}
      onLogout={handleLogout}
      userLabel={user?.name || user?.email}
      userInitials={initials}
      mainScrollable={!isChatRoute}
    >
      <Outlet />
    </SidebarShell>
  );
}
