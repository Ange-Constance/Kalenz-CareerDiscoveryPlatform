import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronRight } from "../common/Icons";
import Logo from "../common/Logo";

function SidebarNavItem({ path, label, Icon, end = true, onClick, active }) {
  const baseClass = [
    "flex items-center gap-3 px-4 py-3 rounded-button border transition-all duration-200 w-full text-left",
    "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
    "[-webkit-tap-highlight-color:transparent]",
  ].join(" ");

  if (onClick) {
    const isActive = Boolean(active);
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} ${
          isActive
            ? "bg-klenz-elevated border-klenz-border-orange text-white shadow-[inset_0_0_0_1px_rgba(255,140,0,0.15)]"
            : "border-transparent text-klenz-muted hover:border-klenz-border/50 hover:text-white hover:bg-klenz-elevated/50"
        }`}
      >
        <Icon active={isActive} className="w-5 h-5 shrink-0" />
        <span className="text-sm font-normal flex-1 truncate">{label}</span>
        <ChevronRight
          aria-hidden
          className={`w-4 h-4 shrink-0 text-klenz-orange transition-opacity duration-200 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        />
      </button>
    );
  }

  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        [
          baseClass,
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

export default function SidebarShell({
  logoTo,
  navItems,
  onLogout,
  userLabel,
  userInitials,
  userMenuLinks = [],
  children,
  mainScrollable = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-klenz-black px-6 py-4 sm:px-8 md:px-10 md:py-5 lg:px-12 lg:py-6 xl:px-14 flex flex-col gap-4 min-h-0 font-sans">
      <header className="panel-elevated card-glow shrink-0 px-6 sm:px-8 md:px-10 py-3.5 flex items-center justify-between">
        <Logo to={logoTo} />
        <div className="flex items-center gap-3 sm:gap-4 relative">
          {userInitials ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-[#534AB7]/30 border border-[#534AB7]/50 text-sm font-semibold text-white flex items-center justify-center hover:bg-[#534AB7]/40 transition-colors"
                aria-label="User menu"
              >
                {userInitials}
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] panel-elevated py-2 shadow-lg">
                    {userLabel && (
                      <p className="px-4 py-2 text-xs text-klenz-muted border-b border-klenz-border truncate max-w-[220px]">
                        {userLabel}
                      </p>
                    )}
                    {userMenuLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-klenz-muted hover:text-white hover:bg-klenz-elevated/50"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : userLabel ? (
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

      <div className="flex flex-1 min-h-0 gap-4 flex-col md:flex-row">
        <aside className="panel card-glow shrink-0 w-full md:w-[272px] lg:w-[280px] xl:w-72 md:h-full md:overflow-hidden p-2.5">
          <nav className="space-y-1 md:max-h-full md:overflow-y-auto md:overscroll-contain">
            {navItems.map((item) => (
              <SidebarNavItem key={item.path || item.label} {...item} />
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
              <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full">{children}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
