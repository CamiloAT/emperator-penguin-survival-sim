import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Network, GitBranch, Download, ExternalLink, Github } from 'lucide-react';
import { PenguinLogo } from '../App.jsx';
import Flowchart from './Flowchart.jsx';

const SECTIONS = [
  { id: 'informe',   label: 'Informe del Proyecto', icon: FileText },
  { id: 'causal',    label: 'Diagrama Causal',       icon: Network },
  { id: 'flujo',     label: 'Diagrama de Flujo',     icon: GitBranch },
  { id: 'codigo',    label: 'Código Fuente',         icon: Github },
];

export default function DocsPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState('informe');

  const scrollTo = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <PenguinLogo size={32} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Emperator Penguin Survival Sim
          </span>
        </div>
        <button
          className="btn btn--ghost"
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </header>

      <main className="landing-main" style={{ paddingTop: '2rem' }}>
        <section style={{ textAlign: 'center', maxWidth: '800px', margin: '1rem auto 3rem' }}>
          <div className="badge-landing" style={{ marginBottom: '1.5rem' }}>
            <FileText size={14} style={{ marginRight: '8px' }} /> Documentación del Proyecto
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            <span style={{ background: 'linear-gradient(to right, var(--accent-orange), var(--accent-red))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Documentación</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Acá vas a encontrar el informe completo del proyecto, el diagrama causal del sistema y el diagrama de flujo del simulador.
          </p>
        </section>

        <nav style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3rem', padding: '0 2rem' }}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '99px',
                background: active === id ? 'rgba(76, 201, 240, 0.15)' : 'rgba(20, 20, 35, 0.4)',
                border: active === id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: active === id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <section id="informe" className="landing-card" style={{ margin: '0 auto 4rem', maxWidth: '1200px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} color="var(--accent-cyan)" /> Informe del Proyecto
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href="/Informe-Proyecto.pdf"
                download
                className="btn btn--ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <Download size={16} /> Descargar
              </a>
              <a
                href="/Informe-Proyecto.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <ExternalLink size={16} /> Abrir en pestaña
              </a>
            </div>
          </div>
          <div style={{ background: 'rgba(5, 8, 20, 0.6)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <iframe
              src="/Informe-Proyecto.pdf"
              title="Informe del Proyecto"
              style={{ width: '100%', height: '900px', border: 'none', display: 'block' }}
            />
          </div>
        </section>

        <section id="causal" className="landing-card" style={{ margin: '0 auto 4rem', maxWidth: '1200px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Network size={24} color="var(--accent-orange)" /> Diagrama Causal
          </h2>
          <div style={{ background: 'rgba(5, 8, 20, 0.6)', borderRadius: 'var(--radius-lg)', overflow: 'auto', border: '1px solid var(--border-subtle)' }}>
            <img
              src="/Diagrama%20Causal.drawio.svg"
              alt="Diagrama Causal del sistema"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </section>

        <section id="flujo" className="landing-card" style={{ margin: '0 auto 4rem', maxWidth: '1200px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitBranch size={24} color="var(--accent-green)" /> Diagrama de Flujo del Simulador
          </h2>
          <div style={{ background: 'rgba(5, 8, 20, 0.6)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)', height: '800px' }}>
            <Flowchart />
          </div>
        </section>

        <section id="codigo" className="landing-card" style={{ margin: '0 auto 4rem', maxWidth: '1200px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Github size={24} color="var(--text-primary)" /> Código Fuente
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            El código fuente completo del simulador (motor ABM, visualización 2D/3D, panel de parámetros, sistema de atajos y componentes UI) está disponible públicamente en GitHub. Sentite libre de explorarlo, clonarlo o proponer mejoras mediante un Pull Request.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/CamiloAT/emperator-penguin-survival-sim"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <Github size={18} /> Ver repositorio en GitHub
              <ExternalLink size={14} style={{ opacity: 0.7 }} />
            </a>
            <a
              href="https://github.com/CamiloAT/emperator-penguin-survival-sim#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <FileText size={18} /> Leer README
              <ExternalLink size={14} style={{ opacity: 0.7 }} />
            </a>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(5, 8, 20, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Stack:</strong> React 18 · Vite 6 · Three.js (React Three Fiber) · React Router v7 · TanStack Hotkeys · Recharts · React Flow · Lucide React. Desplegado en Vercel.
          </div>
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', background: 'rgba(5, 8, 20, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <PenguinLogo size={24} />
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Emperator Penguin Survival Sim</span>
        </div>
        <p style={{ fontSize: '0.85rem' }}>Generado con dinámicas paramétricas de emergencia sistémica.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>© 2026. Investigación Basada en Modelos.</p>
      </footer>
    </div>
  );
}
