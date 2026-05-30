import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flex: 1, width: '100%', minHeight: '60vh',
      background: 'var(--bg-glass)', borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      backdropFilter: 'blur(16px)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div className="penguin-loader">
        <svg width="120" height="120" viewBox="0 0 48 48" className="penguin-anim">
          {/* Snow splash */}
          <path d="M6 32 Q2 26 8 20" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" className="snow-splash" />
          
          {/* Penguin body sliding */}
          <ellipse cx="26" cy="28" rx="16" ry="12" fill="#0d0d14"/>
          <ellipse cx="26" cy="30" rx="11" ry="8" fill="#e8e0d0"/>
          <circle cx="38" cy="24" r="8" fill="#0d0d14"/>
          {/* Orange ear patches */}
          <ellipse cx="40" cy="21" rx="3.5" ry="2.5" transform="rotate(-15 40 21)" fill="#f0a030"/>
          {/* Eye */}
          <circle cx="39" cy="23" r="1.5" fill="white"/>
          <circle cx="39.5" cy="23" r="0.7" fill="#111"/>
          {/* Beak */}
          <path d="M44 24 L48 25 L44 26 Z" fill="#e87a20"/>
          {/* Flipper */}
          <path d="M24 20 Q18 16 12 20" stroke="#1a1a2e" strokeWidth="4" strokeLinecap="round" fill="none"/>
          {/* Feet pushing */}
          <ellipse cx="12" cy="28" rx="4" ry="2" fill="#e87a20"/>
        </svg>
        <div className="snow-trail"></div>
      </div>
      <h2 style={{ marginTop: '2rem', color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 600 }}>Generando Tormenta Antártica</h2>
      <p style={{ color: 'var(--accent-cyan)', marginTop: '0.5rem', fontSize: '1rem', letterSpacing: '1px' }}>
        INICIALIZANDO SIMULACIÓN Y COLONIA...
      </p>
    </div>
  );
}
