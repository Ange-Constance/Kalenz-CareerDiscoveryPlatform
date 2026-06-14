import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-klenz-black/80 backdrop-blur-md border-b border-klenz-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-klenz-muted hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link to="/signup" className="btn-ghost text-sm py-2 px-5">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
