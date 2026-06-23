import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../common/Logo";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Careers", href: "#careers" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-klenz-black/90 backdrop-blur-md border-b border-klenz-border">
      <div className="content-container h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-klenz-muted hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          {user && (
            <>
              <Link to="/history" className="text-sm font-medium text-klenz-muted hover:text-white">
                History
              </Link>
              {user.is_admin && (
                <Link to="/admin" className="text-sm font-medium text-[#c4bfe8] hover:text-white">
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/upload" className="btn-primary text-sm py-2 px-5">
              Dashboard
            </Link>
            <button type="button" onClick={logout} className="btn-ghost text-sm py-2 px-4">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/signup" className="btn-primary text-sm py-2 px-5">
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
}
