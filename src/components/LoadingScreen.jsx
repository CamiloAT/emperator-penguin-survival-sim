import React from 'react';

function PenguinVariant() {
  return (
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
  );
}

function SnowflakeVariant() {
  return (
    <div className="snowflake-loader">
      {/* Ground shadow */}
      <div className="penguin-shadow" />
      {/* Yum particles popping from the beak */}
      <div className="yum-particle yum-particle--1">♥</div>
      <div className="yum-particle yum-particle--2">★</div>
      <div className="yum-particle yum-particle--3">•</div>

      <svg className="penguin-eating" width="220" height="220" viewBox="0 0 220 220">
        {/* Penguin body */}
        <g className="penguin-bob">
          <ellipse cx="110" cy="140" rx="55" ry="60" fill="#0d0d14"/>
          <ellipse cx="110" cy="150" rx="38" ry="48" fill="#e8e0d0"/>
          {/* Yellow chest patch */}
          <ellipse cx="110" cy="115" rx="22" ry="14" fill="#ffd250" opacity="0.85"/>

          {/* Head */}
          <circle cx="110" cy="78" r="36" fill="#0d0d14"/>

          {/* Ear patches */}
          <ellipse cx="90" cy="80" rx="9" ry="14" transform="rotate(-15 90 80)" fill="#f0a030"/>
          <ellipse cx="130" cy="80" rx="9" ry="14" transform="rotate(15 130 80)" fill="#f0a030"/>

          {/* Eyes - blink occasionally */}
          <g className="penguin-eye penguin-eye--left">
            <circle cx="99" cy="72" r="5" fill="white"/>
            <circle cx="100" cy="73" r="2.4" fill="#111"/>
          </g>
          <g className="penguin-eye penguin-eye--right">
            <circle cx="121" cy="72" r="5" fill="white"/>
            <circle cx="122" cy="73" r="2.4" fill="#111"/>
          </g>

          {/* Beak - chomps open/close */}
          <g className="penguin-beak">
            <path d="M100 88 L110 102 L120 88 Z" fill="#e87a20"/>
            <path d="M104 96 L110 102 L116 96 Z" fill="#c25a10" opacity="0.6"/>
          </g>

          {/* Flippers */}
          <ellipse className="penguin-flipper penguin-flipper--left" cx="58" cy="135" rx="11" ry="28" fill="#0d0d14" transform="rotate(-12 58 135)"/>
          <ellipse className="penguin-flipper penguin-flipper--right" cx="162" cy="135" rx="11" ry="28" fill="#0d0d14" transform="rotate(12 162 135)"/>

          {/* Feet */}
          <ellipse cx="92" cy="198" rx="16" ry="6" fill="#e87a20"/>
          <ellipse cx="128" cy="198" rx="16" ry="6" fill="#e87a20"/>
        </g>

        {/* Fish - slides from right toward beak, gets eaten, respawns */}
        <g className="penguin-fish">
          {/* Tail */}
          <path d="M-12 0 L-22 -7 L-19 0 L-22 7 Z" fill="#3a7bb0"/>
          {/* Body */}
          <ellipse cx="0" cy="0" rx="14" ry="7" fill="#5a9ad4"/>
          <ellipse cx="-2" cy="-1" rx="10" ry="3" fill="#7ab8e0" opacity="0.7"/>
          {/* Eye */}
          <circle cx="7" cy="-1.5" r="1.8" fill="white"/>
          <circle cx="7.4" cy="-1.5" r="0.9" fill="#111"/>
          {/* Fin */}
          <path d="M-4 4 L-1 9 L2 4 Z" fill="#3a7bb0"/>
        </g>
      </svg>
    </div>
  );
}

export default function LoadingScreen({
  title = 'Generando Tormenta Antártica',
  subtitle = 'INICIALIZANDO SIMULACIÓN Y COLONIA...',
  variant = 'simulation'
}) {
  const isLanding = variant === 'landing';
  const accentColor = isLanding ? 'var(--accent-cyan)' : 'var(--accent-cyan)';
  const accentGradient = isLanding
    ? 'linear-gradient(to right, var(--accent-cyan), #4cc9f0)'
    : 'linear-gradient(to right, var(--accent-orange), var(--accent-red))';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flex: 1, width: '100%', minHeight: '60vh',
      background: 'var(--bg-glass)', borderRadius: 'var(--radius-xl)',
      border: `1px solid ${isLanding ? 'rgba(76,201,240,0.25)' : 'var(--border-subtle)'}`,
      backdropFilter: 'blur(16px)',
      boxShadow: isLanding
        ? '0 8px 48px rgba(76,201,240,0.15), inset 0 0 80px rgba(76,201,240,0.04)'
        : 'var(--shadow-lg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid backdrop for the landing variant */}
      {isLanding && <div className="snowflake-grid" />}

      {isLanding ? <SnowflakeVariant /> : <PenguinVariant />}

      <h2 style={{
        marginTop: '2rem',
        color: 'var(--text-primary)',
        fontSize: '1.75rem',
        fontWeight: 600,
        background: accentGradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        zIndex: 1,
      }}>{title}</h2>
      <p style={{ color: accentColor, marginTop: '0.5rem', fontSize: '1rem', letterSpacing: '1px', zIndex: 1 }}>
        {subtitle}
      </p>
      {isLanding && (
        <div className="snowflake-progress">
          <div className="snowflake-progress__bar" />
        </div>
      )}
    </div>
  );
}
