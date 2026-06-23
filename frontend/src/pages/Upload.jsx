import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { analyzeCombined, getAnalysisHistory } from '../services/api';
import { getLastAnalysis, setLastAnalysis } from '../utils/lastAnalysis';

const STEPS = [
  '📄 Reading your documents...',
  '🔍 Analyzing your profile...',
  '🤖 Generating your career insights...',
];

const GITHUB_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/[\w.-]+(?:\/[\w.-]+)?\/?$|^[\w.-]+$/i;

function formatSourceLabel(source) {
  if (source === 'cv') return 'CV';
  if (source === 'github') return 'GitHub';
  if (source === 'certificate') return 'Certificate';
  return source;
}

export default function Upload() {
  const navigate = useNavigate();
  const certInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [cvFile, setCvFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [github, setGithub] = useState('');
  const [githubValid, setGithubValid] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [historyCount, setHistoryCount] = useState(0);
  const [recentAnalysis, setRecentAnalysis] = useState(null);

  useEffect(() => {
    getAnalysisHistory()
      .then((result) => {
        const items = result.data || [];
        setHistoryCount(items.length);
        if (items[0]) setRecentAnalysis(items[0]);
      })
      .catch(() => {
        const last = getLastAnalysis();
        if (last) {
          setRecentAnalysis(last);
          setHistoryCount(1);
        }
      });
  }, []);

  const hasInput = Boolean(cvFile || certFile || github.trim());

  const inputChips = useMemo(
    () => [
      { key: 'cv', label: 'CV', active: Boolean(cvFile) },
      { key: 'github', label: 'GitHub', active: Boolean(github.trim()) },
      { key: 'certificate', label: 'Certificate', active: Boolean(certFile) },
    ],
    [cvFile, github, certFile]
  );

  const validateCvFile = (file) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setError('CV must be .pdf or .docx');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('CV must be under 10MB');
      return false;
    }
    setError('');
    return true;
  };

  const validateCertFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Certificate must be a PDF');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Certificate must be under 10MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleGithubBlur = () => {
    const value = github.trim();
    if (!value) {
      setGithubValid(false);
      return;
    }
    setGithubValid(GITHUB_PATTERN.test(value));
    if (!GITHUB_PATTERN.test(value)) {
      setError('Enter a valid GitHub username or profile URL');
    } else {
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!hasInput) {
      setError('Provide at least one input to analyze');
      return;
    }
    if (github.trim() && !GITHUB_PATTERN.test(github.trim())) {
      setError('Enter a valid GitHub username or profile URL');
      return;
    }

    setLoading(true);
    setStepIndex(0);
    setError('');

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 3500);

    try {
      const result = await analyzeCombined({
        file: cvFile,
        github: github.trim() || undefined,
        certificate: certFile,
      });
      clearInterval(interval);

      if (!result.success) throw new Error(result.error || 'Analysis failed');

      setLastAnalysis(result.data);
      navigate('/results', { state: { analysis: result.data } });
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto page-enter">
        {historyCount > 0 && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#534AB7]/10 border border-[#534AB7]/30 text-sm">
            Welcome back! You have {historyCount} previous{' '}
            {historyCount === 1 ? 'analysis' : 'analyses'}.{' '}
            <Link to="/history" className="text-klenz-teal font-medium hover:underline">
              View History →
            </Link>
          </div>
        )}

        <h1 className="page-title text-white">Analyze Your Profile</h1>
        <p className="page-subtitle mb-8">
          Combine your CV, GitHub profile, and certificates for a richer career prediction.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* CV Section */}
        <section className="panel p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-1">CV / Resume</h2>
          <p className="text-xs text-klenz-muted mb-4">PDF or Word (.docx), max 10MB</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f && validateCvFile(f)) setCvFile(f);
            }}
            onClick={() => cvInputRef.current?.click()}
            className={`${dragOver ? 'drop-zone-active' : 'drop-zone'} p-8 text-center cursor-pointer`}
          >
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm text-white">Drag & drop your CV here or click to browse</p>
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && validateCvFile(f)) setCvFile(f);
              }}
            />
          </div>
          {cvFile && (
            <div className="mt-3 panel-elevated px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{cvFile.name}</p>
                <p className="text-xs text-klenz-muted">{(cvFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={() => setCvFile(null)} className="text-xs text-klenz-muted hover:text-red-400">
                Remove
              </button>
            </div>
          )}
        </section>

        {/* GitHub Section */}
        <section className="panel p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-1">GitHub Profile</h2>
          <p className="text-xs text-klenz-muted mb-4">Enter GitHub username or profile URL</p>
          <div className="relative">
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              onBlur={handleGithubBlur}
              placeholder="e.g. octocat or https://github.com/octocat"
              className="input-dark w-full pr-10"
            />
            {githubValid && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-klenz-teal">✓</span>
            )}
          </div>
        </section>

        {/* Certificate Section */}
        <section className="panel p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-1">Upload Certificate (optional)</h2>
          <p className="text-xs text-klenz-muted mb-4">PDF certificate for additional skill validation</p>
          <button type="button" onClick={() => certInputRef.current?.click()} className="btn-dark text-sm">
            Select Certificate PDF
          </button>
          <input
            ref={certInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && validateCertFile(f)) setCertFile(f);
            }}
          />
          {certFile && (
            <div className="mt-3 panel-elevated px-4 py-3 flex justify-between items-center">
              <p className="text-sm">{certFile.name}</p>
              <button type="button" onClick={() => setCertFile(null)} className="text-xs text-klenz-muted hover:text-red-400">
                Remove
              </button>
            </div>
          )}
        </section>

        {/* Input chips + submit */}
        <div className="flex flex-wrap gap-2 mb-4">
          {inputChips.map((chip) => (
            <span
              key={chip.key}
              className={`text-xs px-3 py-1 rounded-full border ${
                chip.active
                  ? 'bg-klenz-teal/10 border-klenz-teal/40 text-klenz-teal'
                  : 'border-klenz-border text-klenz-muted'
              }`}
            >
              {chip.label} {chip.active ? '✓' : '✗'}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !hasInput}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 min-w-[220px]"
        >
          {loading ? <LoadingSpinner size="sm" /> : null}
          {loading ? STEPS[stepIndex] : 'Analyze My Profile'}
        </button>

        {recentAnalysis && (
          <div className="mt-10 panel p-6 border-l-4 border-[#534AB7]">
            <p className="text-xs text-klenz-muted uppercase tracking-wider mb-2">Recent Analysis</p>
            <p className="text-white font-semibold">{recentAnalysis.predicted_career}</p>
            <p className="text-xs text-klenz-muted mt-1">
              {new Date(recentAnalysis.created_at).toLocaleDateString()} ·{' '}
              {recentAnalysis.confidence_pct}% confidence
            </p>
            <button
              type="button"
              onClick={() => navigate('/results', { state: { analysis: recentAnalysis } })}
              className="btn-outline text-sm mt-4"
            >
              View Full Results
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
