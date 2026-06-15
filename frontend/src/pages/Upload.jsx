import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { uploadCV } from '../services/api';

const STEPS = [
  'Extracting your CV...',
  'Analyzing your skills...',
  'Generating your career path...',
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

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
    if (f && validateFile(f)) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CV file first');
      return;
    }

    setLoading(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 3000);

    try {
      const result = await uploadCV(file);
      clearInterval(interval);

      if (!result.success) throw new Error(result.error || 'Upload failed');

      localStorage.setItem('lastAnalysis', JSON.stringify(result.data));
      navigate('/results', { state: { analysis: result.data } });
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title text-white">Upload Your CV</h1>
        <p className="page-subtitle mb-8">
          Upload a PDF or Word document (.docx). Max 5MB. We analyze skills and discard the file.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-panel p-12 text-center cursor-pointer transition-all ${
            dragOver ? 'border-klenz-orange bg-klenz-orange/5' : 'border-klenz-border hover:border-klenz-muted/60 bg-klenz-card'
          }`}
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-white font-medium mb-1">Drag & drop your CV here</p>
          <p className="text-klenz-muted text-sm mb-4">or click to browse — .pdf or .docx only</p>
          <button type="button" className="btn-dark text-sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
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
            <button onClick={() => setFile(null)} className="text-xs text-klenz-muted hover:text-red-400">Remove</button>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="btn-orange flex items-center gap-2 disabled:opacity-50 min-w-[160px] justify-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : null}
            {loading ? STEPS[stepIndex] : 'Analyze CV'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
