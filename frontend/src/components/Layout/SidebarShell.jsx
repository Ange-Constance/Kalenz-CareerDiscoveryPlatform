import { NavLink } from "react-router-dom";
import { ChevronRight } from "../common/Icons";
import Logo from "../common/Logo";

function SidebarNavItem({ path, label, Icon, end = true }) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-button border transition-all duration-200",
          "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
          "[-webkit-tap-highlight-color:transparent]",
          isActive
            ? "bg-klenz-elevated border-klenz-border-orange text-white shadow-[inset_0_0_0_1px_rgba(255,140,0,0.15)]"
            : "border-transparent text-klenz-muted hover:border-klenz-border/50 hover:text-white hover:bg-klenz-elevated/50",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon active={isActive} className="w-5 h-5 shrink-0" />
          <span className="text-sm font-normal flex-1 truncate">{label}</span>
          <ChevronRight
            aria-hidden
            className={`w-4 h-4 shrink-0 text-klenz-orange transition-opacity duration-200 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

/**
 * Shared app shell: top navbar + left sidebar + scrollable main content panel.
 */
export default function SidebarShell({
  logoTo,
  navItems,
  onLogout,
  userLabel,
  children,
  mainScrollable = true,
}) {
  return (
    <div className="h-screen overflow-hidden bg-klenz-black px-6 py-4 sm:px-8 md:px-10 md:py-5 lg:px-12 lg:py-6 xl:px-14 flex flex-col gap-4 min-h-0 font-sans">
      {/* Top navbar */}
      <header className="panel-elevated card-glow shrink-0 px-6 sm:px-8 md:px-10 py-3.5 flex items-center justify-between">
        <Logo to={logoTo} />
        <div className="flex items-center gap-3 sm:gap-4">
          {userLabel ? (
            <span className="hidden md:inline text-xs text-klenz-muted truncate max-w-[220px]">
              {userLabel}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className="btn-ghost text-sm py-2 px-5 shrink-0"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + main — side-by-side from md breakpoint up */}
      <div className="flex flex-1 min-h-0 gap-4 flex-col md:flex-row">
        <aside className="panel card-glow shrink-0 w-full md:w-[272px] lg:w-[280px] xl:w-72 md:h-full md:overflow-hidden p-2.5">
          <nav className="space-y-1 md:max-h-full md:overflow-y-auto md:overscroll-contain">
            {navItems.map((item) => (
              <SidebarNavItem key={item.path} {...item} />
            ))}
          </nav>
        </aside>

        <main className="panel card-glow flex flex-col flex-1 min-h-0 min-w-0 w-full overflow-hidden">
          {mainScrollable ? (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
              <div className="w-full min-h-full px-8 py-8 md:px-12 md:py-10 lg:px-14 lg:py-10 page-enter">
                {children}
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-6 py-4 md:px-10 md:py-6">
              <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
