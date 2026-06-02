import React from 'react';
import { X } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, icon: Icon, iconColor, title, sections }) {
  if (!isOpen) return null;

  return (
    <div className="results-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="results-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {Icon && (
              <div style={{
                background: `${iconColor}22`,
                color: iconColor,
                padding: '0.5rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={22} />
              </div>
            )}
            <h2 style={{ margin: 0, fontSize: '1.4rem', textAlign: 'left' }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {sections.map((section, i) => (
            <div key={i} style={{
              padding: '1rem 1.25rem',
              background: 'rgba(20, 20, 35, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)'
            }}>
              {section.label && (
                <div style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: section.color || 'var(--accent-cyan)',
                  fontWeight: 700,
                  marginBottom: '0.4rem'
                }}>
                  {section.label}
                </div>
              )}
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                {section.text}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button className="btn btn--primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
