import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Careers', href: '#careers' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
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
        </div>

        <Link to="/signup" className="btn-primary text-sm py-2 px-5">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
