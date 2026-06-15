import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl">
      <h1 className="page-title mb-1.5">Settings</h1>
      <p className="page-subtitle mb-8">Manage your account and preferences</p>

      <div className="space-y-4">
        <div className="panel-elevated p-6">
          <h3 className="font-semibold text-sm mb-4">Profile Information</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Email', value: user?.email },
              { label: 'Name', value: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '—' },
              { label: 'GitHub', value: user?.githubUsername || 'Not connected' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-klenz-border last:border-0">
                <span className="text-klenz-muted">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-elevated p-6">
          <h3 className="font-semibold text-sm mb-2">Privacy</h3>
          <p className="text-xs text-klenz-muted leading-relaxed mb-4">
            Uploaded files are processed and deleted immediately. Only extracted competency signals are stored.
          </p>
          <button
            onClick={() => { localStorage.clear(); logout(); }}
            className="text-red-400 text-sm font-medium hover:text-red-300 transition-colors"
          >
            Delete account data & logout
          </button>
        </div>
      </div>
    </div>
  );
}
