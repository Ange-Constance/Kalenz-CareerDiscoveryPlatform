import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-klenz-teal/20 border-klenz-teal/30 text-klenz-teal',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-klenz-orange/20 border-klenz-border-orange text-klenz-orange',
    warning: 'bg-klenz-warning/20 border-klenz-warning/30 text-klenz-warning',
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl border text-sm font-medium z-50 animate-slide-up shadow-xl ${styles[type] || styles.info}`}
    >
      {message}
    </div>
  );
}
