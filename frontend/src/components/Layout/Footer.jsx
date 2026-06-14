import Logo from '../common/Logo';

const footerLinks = {
  Product: ['Features', 'Dashboard', 'Career Matches', 'Roadmap'],
  Company: ['About', 'ALU Capstone', 'Contact'],
  Resources: ['kLab Kigali', 'Andela', 'Google UX Cert'],
  Legal: ['Privacy Policy', 'Terms of Service'],
};

export default function Footer() {
  return (
    <footer className="border-t border-klenz-border bg-klenz-black">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Logo to="/" />
            <p className="text-xs text-klenz-muted mt-4 leading-relaxed max-w-[200px]">
              Your AI-powered career discovery partner for Rwandan tech graduates.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <span className="text-xs text-klenz-muted hover:text-white transition-colors cursor-default">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-klenz-border pt-8 text-center">
          <p className="text-xs text-klenz-muted">
            &copy; {new Date().getFullYear()} KaLenz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
