import { useEffect } from 'react';

export default function Toast({ type = 'success', message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`} role="status">
      <span className="toast__icon">{type === 'success' ? '✅' : '⚠️'}</span>
      <p>{message}</p>
      <button className="toast__close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
