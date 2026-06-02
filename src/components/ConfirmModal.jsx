import React from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText }) {
  useHotkey('Escape', () => onClose(), { enabled: isOpen });

  if (!isOpen) return null;

  return (
    <div className="results-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="results-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem', color: 'var(--accent-orange)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--ghost btn--full" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn--primary btn--full" onClick={() => {
            onConfirm();
            onClose();
          }}>
            <RotateCcw size={14} /> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

