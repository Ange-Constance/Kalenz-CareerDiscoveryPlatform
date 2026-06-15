import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  CareersIcon,
  ChatIcon,
  ChevronRight,
  ProfileIcon,
  RoadmapIcon,
  UploadIcon,
} from "../common/Icons";
import Logo from "../common/Logo";

const navItems = [
  { path: "/dashboard/upload", label: "Upload Files", Icon: UploadIcon },
  { path: "/dashboard/careers", label: "Careers", Icon: CareersIcon },
  { path: "/dashboard/profile", label: "Profile", Icon: ProfileIcon },
  { path: "/dashboard/roadmap", label: "Roadmap", Icon: RoadmapIcon },
  { path: "/dashboard/chat", label: "Career Assistant", Icon: ChatIcon },
];

function SidebarNavItem({ path, label, Icon }) {
  return (
    <NavLink
      to={path}
      end
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-button border transition-colors",
          "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
          "[-webkit-tap-highlight-color:transparent]",
          isActive
            ? "bg-klenz-elevated border-klenz-border text-white active:bg-klenz-elevated"
            : "border-transparent text-klenz-muted hover:border-klenz-border/40 hover:text-white hover:bg-klenz-elevated/60 active:bg-klenz-elevated/60",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon active={isActive} className="w-5 h-5 shrink-0" />
          <span className="text-sm font-normal flex-1 truncate">{label}</span>
          <ChevronRight
            aria-hidden
            className={`w-4 h-4 shrink-0 text-klenz-muted transition-opacity duration-150 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const isChatRoute = location.pathname.includes("/dashboard/chat");

  return (
    <div className="h-screen overflow-hidden bg-klenz-black px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 xl:px-16 flex flex-col gap-4">
      {/* Top bar — fixed, non-scrollable */}
      <header className="panel-elevated shrink-0 px-10 py-3.5 flex items-center justify-between">
        <Logo to="/dashboard/upload" />
        <button onClick={logout} className="btn-ghost text-sm py-2 px-5">
          Logout
        </button>
      </header>

      <div className="flex flex-1 min-h-0 gap-4 flex-col lg:flex-row">
        {/* Sidebar — fixed, non-scrollable */}
        <aside className="panel shrink-0 w-full lg:w-64 lg:overflow-hidden p-2.5">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarNavItem key={item.path} {...item} />
            ))}
          </nav>
        </aside>

        {/* Main content — only scrollable region */}
        <main
          className={`panel flex-1 min-h-0 px-10 py-6 md:px-12 md:py-8 flex flex-col ${
            isChatRoute
              ? "overflow-hidden"
              : "overflow-y-auto overscroll-contain"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
