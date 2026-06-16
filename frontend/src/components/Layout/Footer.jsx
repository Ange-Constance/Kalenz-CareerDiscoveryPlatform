import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex justify-center">
          <Logo to="/" />
        </div>
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            marginTop: '8px',
          }}
        >
          AI-powered career discovery for Rwanda&apos;s tech graduates
        </p>
        <p
          style={{
            color: 'var(--color-text-subtle)',
            fontSize: '12px',
            marginTop: '24px',
          }}
        >
          © 2025 KarrerLenz. Built for Rwanda.
        </p>
      </div>
    </footer>
  );
}
