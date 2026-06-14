import { useState, useRef } from 'react';
import { evidenceAPI } from '../services/api';
import Toast from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LargeUploadIcon, UploadIcon } from '../components/common/Icons';

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
      type: file.name.endsWith('.pdf') ? 'document' : 'cv',
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
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

      showToast('Evidence submitted successfully!', 'success');
      setFiles([]);
      setGithubUsername('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Upload Evidence</h1>
        <p className="text-sm text-klenz-muted">Share your Github, Certificate or CV</p>
      </div>

      {/* GitHub username */}
      <div className="mb-6">
        <label className="block text-sm text-klenz-muted mb-2">GitHub Username (optional)</label>
        <input
          type="text"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          placeholder="your-github-username"
          className="input-dark max-w-md"
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex-1 min-h-[280px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragOver
            ? 'border-klenz-orange bg-klenz-orange/5'
            : 'border-klenz-border hover:border-klenz-muted bg-klenz-elevated/30'
        }`}
      >
        <LargeUploadIcon className="mb-4" />
        <p className="text-white font-medium mb-1">Drag and Drop or Click Choose File</p>
        <p className="text-xs text-klenz-muted mb-6">File you select will appear below.</p>
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
          onChange={(e) => { if (e.target.files.length) addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map(({ id, file }) => (
            <div key={id} className="panel-elevated px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <UploadIcon className="w-4 h-4 text-klenz-orange shrink-0" active />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-klenz-muted shrink-0">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button onClick={() => removeFile(id)} className="text-klenz-muted hover:text-red-400 text-sm ml-2">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-orange flex items-center gap-2 px-8 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : <UploadIcon className="w-4 h-4" active />}
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
