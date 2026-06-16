import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { uploadCV } from '../../services/api';
import { setLastAnalysis } from '../../utils/lastAnalysis';

const STEPS = [
  'Extracting your CV...',
  'Analyzing your skills...',
  'Generating your career path...',
];

export default function CVUploadSection({ compact = false, onSuccess, showResultsLink = true }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (f) => {
    const ext = f.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx')) {
      setError('Only .pdf and .docx files are allowed');
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = (f) => {
    if (f && validateFile(f)) {
      setFile(f);
      setDone(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CV file first');
      return;
    }

    setLoading(true);
    setStepIndex(0);
    setError('');

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 3000);

    try {
      const result = await uploadCV(file);
      clearInterval(interval);

      if (!result.success) throw new Error(result.error || 'Upload failed');

      setLastAnalysis(result.data);
      setDone(true);
      onSuccess?.(result.data);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const dropZoneClass = done && file
    ? 'drop-zone-success'
    : dragOver
      ? 'drop-zone-active'
      : 'drop-zone';

  return (
    <div className={compact ? '' : 'mb-8'}>
      {!compact && (
        <>
          <h2 className="text-lg font-semibold text-white mb-1">Analyze Your CV</h2>
          <p className="page-subtitle mb-4">
            Upload a PDF or Word document (.docx). Max 5MB. We analyze skills and discard the file.
          </p>
        </>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {done && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-klenz-teal/10 border border-klenz-teal/30 text-klenz-teal text-sm">
          CV analyzed successfully!
          {showResultsLink && (
            <>
              {' '}
              <Link to="/results" className="underline font-medium">
                View results →
              </Link>
            </>
          )}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`${dropZoneClass} ${compact ? 'p-8' : 'p-12'} text-center cursor-pointer`}
      >
        <div className="text-4xl mb-4">📄</div>
        <p className="text-white font-medium mb-1">Drag & drop your CV here</p>
        <p className="text-klenz-muted text-sm mb-4">or click to browse — .pdf or .docx only</p>
        <button
          type="button"
          className="btn-dark text-sm"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Select File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {file && (
        <div className="mt-4 panel-elevated px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-klenz-muted">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button type="button" onClick={() => setFile(null)} className="text-xs text-klenz-muted hover:text-red-400">
            Remove
          </button>
        </div>
      )}

      <div className={`${compact ? 'mt-4' : 'mt-8'} flex justify-end`}>
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 min-w-[160px] justify-center"
        >
          {loading ? <LoadingSpinner size="sm" /> : null}
          {loading ? STEPS[stepIndex] : 'Analyze CV'}
        </button>
      </div>
    </div>
  );
}
