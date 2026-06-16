import { useRef, useState } from 'react';
import { UploadIcon } from '../components/common/Icons';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import CVUploadSection from '../components/upload/CVUploadSection';
import { evidenceAPI } from '../services/api';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [githubUsername, setGithubUsername] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const addFiles = (newFiles) => {
    const mapped = Array.from(newFiles).map((file) => ({
      file,
      id: `${file.name}-${Date.now()}`,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleSubmitEvidence = async () => {
    if (!files.length && !githubUsername.trim()) {
      showToast('Add a file or GitHub username first', 'error');
      return;
    }

    setLoading(true);
    try {
      if (githubUsername.trim()) {
        await evidenceAPI.uploadGitHub(githubUsername.trim());
      }

      for (const { file } of files) {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          if (file.name.toLowerCase().includes('cert')) {
            await evidenceAPI.uploadCertificate(file);
          } else {
            await evidenceAPI.uploadCV(file);
          }
        } else {
          await evidenceAPI.uploadCV(file);
        }
      }

      showToast('Additional evidence submitted!', 'success');
      setFiles([]);
      setGithubUsername('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="page-title mb-1.5">Upload Evidence</h1>
        <p className="page-subtitle">Analyze your CV and optionally add GitHub or certificate evidence</p>
      </div>

      <CVUploadSection compact showResultsLink />

      <div className="mt-10 pt-8 border-t border-klenz-border">
        <h2 className="text-lg font-semibold text-white mb-1">Additional Evidence (optional)</h2>
        <p className="page-subtitle mb-6">Share GitHub, certificates, or extra CV files</p>

        <div className="mb-6">
          <label className="block text-sm text-klenz-muted mb-2">GitHub Username</label>
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="your-github-username"
            className="input-dark max-w-md"
          />
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`min-h-[280px] md:min-h-[320px] border-2 border-dashed rounded-panel flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragOver
              ? 'drop-zone-active'
              : 'drop-zone'
          }`}
        >
          <p className="text-white font-medium text-sm mb-1">Drag and Drop or Click Choose File</p>
          <p className="text-xs text-klenz-muted mb-4">PDF certificates or CV files</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="btn-dark text-sm"
          >
            Select File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files.length) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map(({ id, file }) => (
              <div key={id} className="panel-elevated px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <UploadIcon className="w-4 h-4 text-klenz-orange shrink-0" active />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <button type="button" onClick={() => removeFile(id)} className="text-klenz-muted hover:text-red-400 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSubmitEvidence}
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            {loading ? 'Submitting...' : 'Submit Evidence'}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
