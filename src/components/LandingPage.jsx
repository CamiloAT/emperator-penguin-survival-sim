import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ShieldAlert, ShieldCheck, ThermometerSnowflake, Wind, Egg, Users, Flame, Snowflake, RefreshCw, HelpCircle, Info, Calendar, Skull } from 'lucide-react';
import { PenguinLogo } from '../App.jsx';
import InfoModal from './InfoModal.jsx';

function LoopCard({ type, title, desc }) {
  return (
    <div style={{
      minWidth: '320px', padding: '1.5rem', background: 'rgba(20, 20, 35, 0.6)',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', 
      backdropFilter: 'blur(8px)', boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{
          background: type.startsWith('R') ? 'rgba(239,71,111,0.15)' : 'rgba(76,201,240,0.15)',
          color: type.startsWith('R') ? 'var(--accent-red)' : 'var(--accent-cyan)',
          padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 'bold', fontSize: '0.75rem', border: `1px solid ${type.startsWith('R') ? 'rgba(239,71,111,0.3)' : 'rgba(76,201,240,0.3)'}`
        }}>{type}</div>
        <h4 style={{ fontWeight: 'bold', margin: 0, fontSize: '1.1rem' }}>{title}</h4>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'normal', margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

export default function LandingPage({ onEnterParams }) {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  // Drag-to-scroll for the feedback loops section
  const scrollRef = useRef(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current.isDown = true;
    dragState.current.startX = (e.pageX || e.touches?.[0]?.pageX || 0) - el.offsetLeft;
    dragState.current.scrollLeft = el.scrollLeft;
    setIsDragging(true);
  };
  const handleDragMove = (e) => {
    if (!dragState.current.isDown) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = (e.pageX || e.touches?.[0]?.pageX || 0) - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.4;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };
  const handleDragEnd = () => {
    dragState.current.isDown = false;
    setIsDragging(false);
  };

  const goToParams = () => {
    if (onEnterParams) {
      onEnterParams();
    } else {
      navigate('/parameters');
    }
  };

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <PenguinLogo size={32} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Emperator Penguin Survival Sim</span>
        </div>
      </header>

      <main className="landing-main">
        {/* HERO */}
        <section style={{ textAlign: 'center', maxWidth: '800px', margin: '3rem auto 0' }}>
          <div className="badge-landing" style={{ marginBottom: '2rem' }}>
            <Activity size={14} style={{ marginRight: '8px' }} /> Proyecto de simulación regional Antártica
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '2rem', color: 'var(--text-primary)' }}>
            Simulación del Agrupamiento de <span style={{ background: 'linear-gradient(to right, var(--accent-orange), var(--accent-red))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pingüinos Emperador</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 3rem' }}>
            Descubre cómo los pingüinos emperador se agrupan en grupo (el famoso "huddle") para sobrevivir el invierno antártico. Esta simulación interactiva te permite ver qué pasa con la colonia cuando cambia la temperatura, el viento o el tamaño del grupo.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn--primary" style={{ padding: '0.9rem 2rem', fontSize: '1.1rem', borderRadius: '99px' }} onClick={goToParams}>
              Probar la Simulación <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </section>

        {/* HIGHLIGHT STATS */}
        <section className="bento-grid-3 text-center" style={{ gap: '2rem', padding: '0 2rem', marginTop: '5rem', marginBottom: '6rem' }}>
          <div
            onClick={() => setActiveModal('penguins')}
            role="button"
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActiveModal('penguins')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid transparent', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'rgba(248, 150, 30, 0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-orange)' }}>20-200</div>
              <Info size={16} color="var(--text-muted)" style={{ marginTop: '1rem' }} />
            </div>
            <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 600 }}>Pingüinos en el Huddle</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>Clic para más detalle</div>
          </div>
          <div
            onClick={() => setActiveModal('days')}
            role="button"
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActiveModal('days')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid transparent', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'rgba(76, 201, 240, 0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>92 Días</div>
              <Info size={16} color="var(--text-muted)" style={{ marginTop: '1rem' }} />
            </div>
            <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 600 }}>Duración del Invierno</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>Clic para más detalle</div>
          </div>
          <div
            onClick={() => setActiveModal('temp')}
            role="button"
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActiveModal('temp')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid transparent', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'rgba(239, 71, 111, 0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-red)' }}>&le; 28°C</div>
              <Info size={16} color="var(--text-muted)" style={{ marginTop: '1rem' }} />
            </div>
            <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 600 }}>Muerte por Hipotermia</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>Clic para más detalle</div>
          </div>
        </section>

        {/* FEATURE CARDS (Bento grid 2-col) */}
        <section className="bento-grid">
          <div className="landing-card bento-span-2" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', padding: '10px', borderRadius: '12px', background: 'rgba(76,201,240,0.12)', border: '1px solid rgba(76,201,240,0.25)', width: 'fit-content' }}>
              <HelpCircle size={32} style={{ color: 'var(--accent-cyan)' }} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pregunta de Investigación</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.9rem', margin: 0 }}>
              ¿Puede la colonia organizarse sola para que sobrevivan la mayor cantidad de adultos y huevos durante los 92 días del invierno antártico?
            </p>
          </div>
          <div className="landing-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', padding: '10px', borderRadius: '12px', background: 'rgba(76,201,240,0.12)', border: '1px solid rgba(76,201,240,0.25)', width: 'fit-content' }}>
              <Snowflake size={32} style={{ color: 'var(--accent-cyan)' }} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>El Problema del Frío</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.9rem', margin: 0 }}>
              Los que quedan en el borde reciben el viento de lleno y se enfrían rápido. Si un pingüino o su huevo se enfría demasiado, no se recuperan.
            </p>
          </div>
          <div className="landing-card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', padding: '10px', borderRadius: '12px', background: 'rgba(248, 150, 30, 0.12)', border: '1px solid rgba(248, 150, 30, 0.25)', width: 'fit-content' }}>
              <RefreshCw size={32} style={{ color: 'var(--accent-orange)' }} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>La Solución: Rotar</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.9rem', margin: 0 }}>
              Los del centro van al borde y los del borde pasan al centro. Es una rueda constante y es lo único que los mantiene vivos.
            </p>
          </div>
          <div className="landing-card bento-span-2" style={{ background: 'linear-gradient(145deg, rgba(20, 20, 35, 0.8), rgba(248, 150, 30, 0.05))', border: '1px solid rgba(248, 150, 30, 0.2)', padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', padding: '10px', borderRadius: '12px', background: 'rgba(248, 150, 30, 0.12)', border: '1px solid rgba(248, 150, 30, 0.3)', width: 'fit-content' }}>
              <Activity size={32} style={{ color: 'var(--accent-orange)' }} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>¿Por qué una Simulación?</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.9rem', margin: 0 }}>
              Las fórmulas tradicionales no alcanzan para predecir a los pingüinos: depende de cada uno, sus vecinos y el clima. Con un modelo basado en agentes, cada pingüino decide solo, y del conjunto de decisiones simples surge el comportamiento del grupo entero.
            </p>
          </div>
        </section>

        {/* CITY SYSTEMS -> Colony Systems */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <div className="badge-landing" style={{ background: 'rgba(76,201,240,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(76,201,240,0.3)' }}>
              <ThermometerSnowflake size={14} style={{ marginRight: '8px' }} /> Entorno Parametrizado
            </div>
          </div>
          <div className="bento-grid-3 text-center" style={{ gap: '1.5rem' }}>
            <div className="landing-card" style={{ padding: '2.5rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>Los del Borde</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Son los pingüinos que quedan en los costados del grupo. Reciben el viento y el frío de lleno, sin ninguna protección.</p>
              <div style={{ background: 'rgba(5, 8, 20, 0.5)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><span>Pérdida de calor</span> <span style={{color:'var(--accent-red)'}}>Muy rápida</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Gasto de energía</span> <span style={{color:'var(--accent-red)'}}>Al máximo</span></div>
              </div>
            </div>
            <div className="landing-card" style={{ padding: '2.5rem 1.5rem', border: '1px solid rgba(248, 150, 30, 0.3)', boxShadow: '0 0 30px rgba(248, 150, 30, 0.05)' }}>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-orange)', fontWeight: 700 }}>El Centro (The Huddle)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Es la zona más protegida del grupo, donde los pingüinos se aprietan unos contra otros y se mantienen calentitos.</p>
              <div style={{ background: 'rgba(5, 8, 20, 0.5)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><span>Acumulación de calor</span> <span style={{color:'var(--accent-orange)'}}>Estable</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Recuperación</span> <span style={{color:'var(--accent-green)'}}>Buena</span></div>
              </div>
            </div>
            <div className="landing-card" style={{ padding: '2.5rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-purple)', fontWeight: 700 }}>El Huevo</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>El huevo va siempre arriba de las patas del padre, tapado por un pliegue de piel que lo mantiene a 36°C. Si se cae, se congela en minutos.</p>
              <div style={{ background: 'rgba(5, 8, 20, 0.5)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><span>Riesgo de caída</span> <span style={{color:'var(--accent-yellow)'}}>Aleatorio (0.5%)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Rescate</span> <span style={{color:'var(--accent-red)'}}>Difícil</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* FORRESTER + SIGNALS (split 2-col) */}
        <section className="bento-grid">
          <div className="landing-card flex flex-col justify-center">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Cómo es un Pingüino por Dentro</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Sus números vitales:</strong>
                <span style={{ fontSize: '0.95rem' }}>Temperatura del cuerpo (38°C) y reserva de grasa (empieza en 100%). Son como su "barra de vida".</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Cómo recupera calor:</strong>
                <span style={{ fontSize: '0.95rem' }}>Recibe calor de los pingüinos que tiene al lado, y su propio cuerpo puede generar calor extra quemando grasa cuando hace mucho frío.</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Lo que también mira:</strong>
                <span style={{ fontSize: '0.95rem' }}>La fuerza del viento, en qué fase del invierno está y si está cuidando un huevo o no.</span>
              </li>
            </ul>
          </div>
          <div className="landing-card">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Señales de Peligro</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(239,71,111,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,71,111,0.2)' }}>
                <div style={{ color: 'var(--accent-red)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.25rem' }}>≤ 28°C</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Muerte del pingüino</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Si el cuerpo del pingüino se enfría tanto, sus órganos dejan de funcionar y muere.</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(76,201,240,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(76,201,240,0.2)' }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.25rem' }}>t &gt; 180s</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Muerte del embrión</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Si el huevo queda en el hielo más de 3 minutos sin que lo rescaten, se congela y el bebé muere.</div>
              </div>
            </div>
          </div>
        </section>

        {/* SCENARIOS */}
        <section>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 800, textAlign: 'center' }}>Escenarios que se pueden Probar</h2>
          <div className="bento-grid-3 text-center">
            <div className="landing-card" style={{ padding: '2rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Invierno Normal</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                El clima antártico clásico, sin sorpresas. La mayoría de los pingüinos lo logra pasar: sobrevive entre el 80% y el 85% de la colonia.
              </p>
            </div>
            <div className="landing-card" style={{ padding: '2rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-orange)' }}>Frío Extremo</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                El invierno se estira y el frío se vuelve más fuerte de lo normal. Los pingüinos gastan más energía y los más débiles de la colonia no lo aguantan.
              </p>
            </div>
            <div className="landing-card" style={{ padding: '2rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-red)' }}>Tormentas Fuertes</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Ráfagas de viento por encima de 180 km/h rompen la formación del grupo. El frío se mete hasta el centro y arrasa con todo: es un efecto dominó.
              </p>
            </div>
          </div>
        </section>

        {/* FEEDBACK LOOPS - Interactable */}
        <section style={{ margin: '1rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="badge-landing" style={{ background: 'rgba(76,201,240,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(76,201,240,0.3)' }}>
              <RefreshCw size={14} style={{ marginRight: '8px' }} /> Ciclos del Sistema · Arrastrá para explorar
            </div>
          </div>
          <div
            className="scroll-container"
            ref={scrollRef}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          >
            <div className="scroll-track" style={{ animation: 'none' }}>
              <LoopCard type="B1" title="El Centro Protege" desc="Cuando un pingüino entra al centro del grupo, recupera calor y energía. Así puede seguir funcionando bien todo el invierno." />
              <LoopCard type="R1" title="Lentos por el Huevo" desc="Los pingüinos que llevan un huevo encima se mueven más despacio, así que les cuesta más meterse rápido al centro cuando hace falta." />
              <LoopCard type="B2" title="El Calor se Comparte" desc="Los pingüinos calientes del centro rotan hacia los bordes y dejan entrar a los que están congelándose. Es un ciclo bueno para todos." />
              <LoopCard type="R2" title="Efecto Dominó" desc="Si se congelan muchos pingüinos de los bordes, el grupo pierde la protección contra el viento y el frío llega hasta el centro." />
            </div>
          </div>
        </section>

        {/* MULTI-AGENT SIMULATOR (PASSI-inspired) */}
        <section className="bento-grid" style={{ marginTop: '2rem' }}>
          <div className="landing-card bento-span-2" style={{ background: 'linear-gradient(145deg, rgba(20, 20, 35, 0.8), rgba(76, 201, 240, 0.05))', border: '1px solid rgba(76, 201, 240, 0.2)' }}>
            <div style={{ marginBottom: '1.5rem', padding: '14px', borderRadius: '14px', background: 'rgba(76,201,240,0.12)', border: '1px solid rgba(76,201,240,0.3)', width: 'fit-content' }}>
              <Users size={40} style={{ color: 'var(--accent-cyan)' }} strokeWidth={2.2} />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>Un Simulador de Múltiples Agentes</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '1rem' }}>
              Este proyecto está construido siguiendo la filosofía de un <strong style={{ color: 'var(--text-primary)' }}>simulador multi-agente (MAS)</strong>: cada pingüino es un agente autónomo que toma sus propias decisiones, interactúa con los demás y responde al ambiente que lo rodea. El comportamiento de toda la colonia emerge de la suma de esos pequeños comportamientos individuales.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem', margin: 0 }}>
              El diseño se basa en la metodología <strong style={{ color: 'var(--text-primary)' }}>PASSI</strong> (Process for Agent Societies Specification and Implementation), que permite organizar la colonia como una <em>sociedad de agentes</em> con roles bien definidos, tareas concretas y protocolos claros de interacción entre ellos. PASSI fue elegida porque su modelo de "sociedad de agentes" encaja perfecto con un grupo de pingüinos que cooperan para sobrevivir: cada uno cumple un rol, todos se comunican a través de reglas simples y el resultado global surge de esas interacciones locales.
            </p>
          </div>
          <div className="landing-card">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Conceptos que Usamos</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: 'var(--text-secondary)', listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>Sociedad de Agentes:</strong>
                <span style={{ fontSize: '0.95rem' }}>La colonia entera funciona como una sociedad donde los pingüinos cooperan para sobrevivir.</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>Roles:</strong>
                <span style={{ fontSize: '0.95rem' }}>Cada pingüino puede ser del borde, del centro, o estar buscando un huevo perdido.</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>Tareas:</strong>
                <span style={{ fontSize: '0.95rem' }}>Moverse, transferir calor, generar calor propio, cuidar el huevo, rescatarlo si se cae.</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>Entorno:</strong>
                <span style={{ fontSize: '0.95rem' }}>La grilla, el viento, la temperatura y las fases del invierno que afectan a todos por igual.</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>Interacciones:</strong>
                <span style={{ fontSize: '0.95rem' }}>Intercambio de calor con los vecinos, rotaciones de posición y rescate de huevos.</span>
              </li>
            </ul>
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

      <InfoModal
        isOpen={activeModal === 'penguins'}
        onClose={() => setActiveModal(null)}
        icon={Users}
        iconColor="var(--accent-orange)"
        title="Pingüinos en el Huddle (20-200)"
        sections={[
          {
            label: 'Tamaño del Grupo',
            color: 'var(--accent-orange)',
            text: 'El simulador te permite crear una colonia desde un huddle pequeño de 20 pingüinos hasta una manada grande de 200. Por defecto arranca con 80, que es un tamaño típico de una colonia real de pingüinos emperador.'
          },
          {
            label: '¿Por qué importa el tamaño?',
            color: 'var(--accent-cyan)',
            text: 'Con pocos pingüinos el huddle no genera suficiente calor colectivo y los bordes quedan muy expuestos al viento. Con muchos pingüinos la rotación interna funciona mejor y la supervivencia sube, pero también se gastan más reservas de energía por la actividad del grupo.'
          },
          {
            label: 'Cómo lo configurás',
            color: 'var(--text-secondary)',
            text: 'Antes de iniciar la simulación vas a encontrar un control deslizante de "Tamaño de la Colonia" que te deja elegir cualquier valor entre 20 y 200, en pasos de 5.'
          }
        ]}
      />

      <InfoModal
        isOpen={activeModal === 'days'}
        onClose={() => setActiveModal(null)}
        icon={Calendar}
        iconColor="var(--accent-cyan)"
        title="Los 92 Días del Invierno"
        sections={[
          {
            label: 'Duración Total',
            color: 'var(--accent-cyan)',
            text: 'La simulación cubre los 92 días más duros del invierno antártico, que es exactamente el tiempo que los pingüinos emperador macho pasan incubando el huevo en el hielo sin comer nada.'
          },
          {
            label: 'Fase 1 · Inicio de Incubación (Días 1-30, Junio)',
            color: 'var(--accent-green)',
            text: 'Las temperaturas ya son muy bajas, entre -25°C y -35°C, y hay vientos moderados de 40 a 80 km/h. Las reservas de grasa todavía están llenas, así que la supervivencia es alta.'
          },
          {
            label: 'Fase 2 · Invierno Profundo (Días 31-61, Julio)',
            color: 'var(--accent-red)',
            text: 'La etapa más peligrosa. Las temperaturas caen hasta entre -40°C y -60°C, y los vientos pueden alcanzar los 200 km/h. Las reservas energéticas ya están bajo mínimos: es donde más pingüinos mueren.'
          },
          {
            label: 'Fase 3 · Pre-Eclosión (Días 62-92, Agosto)',
            color: 'var(--accent-orange)',
            text: 'La temperatura sube un poco, entre -20°C y -30°C, y los vientos bajan a 50-60 km/h. Los huevos que sobrevivieron están por eclosionar. Los pingüinos están al límite de su energía.'
          }
        ]}
      />

      <InfoModal
        isOpen={activeModal === 'temp'}
        onClose={() => setActiveModal(null)}
        icon={Skull}
        iconColor="var(--accent-red)"
        title="Muerte por Hipotermia (≤ 28°C)"
        sections={[
          {
            label: 'Temperatura Corporal Normal',
            color: 'var(--accent-green)',
            text: 'Un pingüino emperador sano mantiene su cuerpo a 38°C, igual que nosotros. Lo increíble es que lo logra parado en hielo a -50°C gracias al huddle y a sus reservas de grasa.'
          },
          {
            label: 'Cómo Bajan los 38°C',
            color: 'var(--accent-orange)',
            text: 'Cuando un pingüino queda en el borde del grupo, expuesto al viento polar, su cuerpo empieza a perder calor. Si está mucho tiempo en la frontera sin rotar al centro, su temperatura puede caer por debajo de los 34°C, momento en el que el pingüino busca urgentemente meterse al interior del huddle.'
          },
          {
            label: 'El Umbral Letal: 28°C',
            color: 'var(--accent-red)',
            text: 'Si la temperatura corporal del pingüino baja a 28°C o menos, su cuerpo ya no puede funcionar: falla la termogénesis (la producción interna de calor), se agotan las reservas de energía y el pingüino muere. Es un punto de no retorno: una vez que se cruza, no se recupera.'
          },
          {
            label: 'La Diferencia con los Huevos',
            color: 'var(--accent-cyan)',
            text: 'Los huevos son todavía más frágiles: necesitan estar a 36°C de forma constante dentro del pliegue pélvico del padre. Si el huevo cae al hielo y no se recupera dentro de los 3 minutos, se congela y el embrión muere.'
          }
        ]}
      />
    </div>
  );
}

