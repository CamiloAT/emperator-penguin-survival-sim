import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ShieldAlert, ShieldCheck, ThermometerSnowflake, Wind, Egg, Users, Flame, Snowflake, RefreshCw, HelpCircle } from 'lucide-react';
import { PenguinLogo } from '../App.jsx';

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

export default function LandingPage() {
  const navigate = useNavigate();

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
            Dinámica de Agrupamiento y Supervivencia bajo <span style={{ background: 'linear-gradient(to right, var(--accent-orange), var(--accent-red))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Estrés Térmico Extremo.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 3rem' }}>
            Evaluación termo-dinámica interactiva. Un modelo computacional basado en agentes para analizar cómo los gradientes de temperatura y los vientos huracanados condicionan la vida del pingüino emperador.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn--primary" style={{ padding: '0.9rem 2rem', fontSize: '1.1rem', borderRadius: '99px' }} onClick={() => navigate('/parameters')}>
              Explorar Modelo <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </section>

        {/* HIGHLIGHT STATS */}
        <section className="bento-grid-3 text-center" style={{ gap: '2rem', padding: '0 2rem', marginTop: '5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>80-200</div>
            <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 600 }}>Agentes en Enjambre</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>92 Días</div>
            <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 600 }}>Tiempos de Calibración</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-red)', marginBottom: '0.5rem' }}>&le; 32°C</div>
            <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', fontWeight: 600 }}>Umbral Crítico Corporal</div>
          </div>
        </section>

        {/* FEATURE CARDS (Bento grid 2-col) */}
        <section className="bento-grid">
          <div className="landing-card bento-span-2">
            <HelpCircle size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '1rem', background: 'rgba(76,201,240,0.1)', padding: '6px', borderRadius: '8px', width: 'auto' }} />
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', fontWeight: 700 }}>Pregunta de Investigación</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.1rem' }}>
              ¿Cómo logra una colonia de pingüinos emperador autorregularse para maximizar la supervivencia del grupo y de sus embriones, balanceando la necesidad termodinámica de rotación del <i>huddle</i> con el riesgo estocástico de pérdida y congelación de huevos bajo las distintas fases del invierno antártico?
            </p>
          </div>
          <div className="landing-card">
            <Snowflake size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem', background: 'rgba(76,201,240,0.1)', padding: '12px', borderRadius: '12px', width: 'auto' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', fontWeight: 600 }}>Fragilidad Termodinámica</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Los individuos en el contorno disipan calor a una tasa acelerada. Cuando sus niveles descienden del margen operativo, se desencadena una cascada que afecta inmediatamente la inviabilidad por congelación.
            </p>
          </div>
          <div className="landing-card">
            <RefreshCw size={32} style={{ color: 'var(--accent-orange)', marginBottom: '1.5rem', background: 'rgba(248, 150, 30, 0.1)', padding: '12px', borderRadius: '12px', width: 'auto' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', fontWeight: 600 }}>Rotación Compensatoria</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              El relevo mecánico natural, donde los ejemplares externos penetran en busca de calor y el epicentro disipa hacia fuera, es el único mecanismo que contrarresta la entropía masiva ambiental.
            </p>
          </div>
          <div className="landing-card bento-span-2" style={{ background: 'linear-gradient(145deg, rgba(20, 20, 35, 0.8), rgba(248, 150, 30, 0.05))', border: '1px solid rgba(248, 150, 30, 0.2)' }}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', fontWeight: 700 }}>Justificación del Enfoque Distribuido (ABM)</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.1rem' }}>
              El ciclo vital antártico representa una estructura interactiva multivariable. Las ecuaciones puras por sí solas no logran capturar el intercambio cinético de posiciones. Utilizar una arquitectura basada en agentes nos permite visualizar el patrón completo emergiendo de simples reglas biológicas locales.
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
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>Periferia Expuesta</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Exposición total a vientos polares. Gradiente convectivo destructivo.</p>
              <div style={{ background: 'rgba(5, 8, 20, 0.5)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><span>Decaimiento Térmico</span> <span style={{color:'var(--accent-red)'}}>Acelerado</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Presión Energética</span> <span style={{color:'var(--accent-red)'}}>Al Límite</span></div>
              </div>
            </div>
            <div className="landing-card" style={{ padding: '2.5rem 1.5rem', border: '1px solid rgba(248, 150, 30, 0.3)', boxShadow: '0 0 30px rgba(248, 150, 30, 0.05)' }}>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-orange)', fontWeight: 700 }}>Núcleo (The Huddle)</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Epicentro protegido por escudos de plumaje de compañeros.</p>
              <div style={{ background: 'rgba(5, 8, 20, 0.5)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><span>Acumulación Térmica</span> <span style={{color:'var(--accent-orange)'}}>Estable</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Recuperación</span> <span style={{color:'var(--accent-green)'}}>Eficiente</span></div>
              </div>
            </div>
            <div className="landing-card" style={{ padding: '2.5rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-purple)', fontWeight: 700 }}>Incubadora Vital</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>El pliegue pélvico a 36°C constantes. Fragilidad sistémica a la intemperie.</p>
              <div style={{ background: 'rgba(5, 8, 20, 0.5)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><span>Riesgo de Caída</span> <span style={{color:'var(--accent-yellow)'}}>Aleatorio (0.5%)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Rescate</span> <span style={{color:'var(--accent-red)'}}>Complejo</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* FORRESTER + SIGNALS (split 2-col) */}
        <section className="bento-grid">
          <div className="landing-card flex flex-col justify-center">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Estructura de Agente</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Niveles (Stocks):</strong>
                <span style={{ fontSize: '0.95rem' }}>Temperatura Corporal [38°C], Reserva Energética General [100%].</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Flujos Constructivos:</strong>
                <span style={{ fontSize: '0.95rem' }}>Transferencia por contacto, termogénesis endógena activa local.</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Variables Auxiliares:</strong>
                <span style={{ fontSize: '0.95rem' }}>Frecuencia de viento global, fase meteorológica actual, estado gestacional.</span>
              </li>
            </ul>
          </div>
          <div className="landing-card">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Señales Críticas de Riesgo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(239,71,111,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,71,111,0.2)' }}>
                <div style={{ color: 'var(--accent-red)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.25rem' }}>≤ 28°C</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Paro Cardiorespiratorio</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>El frío exterior penetra la capa subdérmica y apaga los sistemas del pingüino.</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(76,201,240,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(76,201,240,0.2)' }}>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.25rem' }}>t &gt; 180s</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Mortalidad Embrionaria</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cristalización irrevocable del huevo si cae al suelo helado y no es rescatado.</div>
              </div>
            </div>
          </div>
        </section>

        {/* SCENARIOS */}
        <section>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 800, textAlign: 'center' }}>Trayectorias Predictivas Simuladas</h2>
          <div className="bento-grid-3 text-center">
            <div className="landing-card" style={{ padding: '2rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Línea Base</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Condiciones estándar antárticas. Supervivencia media (80-85%) manteniendo parámetros rotacionales predeterminados.
              </p>
            </div>
            <div className="landing-card" style={{ padding: '2rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-orange)' }}>Invierno Prolongado</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Prolongación del frío severo extremo. Mayor estrés general, forzando mortalidad selectiva superior a los más viejos de la colonia.
              </p>
            </div>
            <div className="landing-card" style={{ padding: '2rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-red)' }}>Tormentas Superiores</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Aumentos de viento &gt;180 km/h que disuelven la integridad de los bordes, demostrando el efecto dominó que destruye el centro (The Huddle).
              </p>
            </div>
          </div>
        </section>

        {/* FEEDBACK LOOPS - Scrolls */}
        <section style={{ margin: '1rem 0' }}>
          <div className="scroll-container">
            <div className="scroll-track">
              <LoopCard type="B1" title="Conservación Endógena Central" desc="Recaudación de energía térmica al moverse al centro asegura capacidad metabólica continua." />
              <LoopCard type="R1" title="Restricción por Incubación" desc="Obligación biomecánica de lentitud en búsqueda reduce salvamento de progenitores expuestos." />
              <LoopCard type="B2" title="Relajo de Frontera" desc="Los agentes nucleares disipan calor abriendo huecos a los perimetrales fríos, un ciclo virtuoso." />
              <LoopCard type="R2" title="Reacción de Hielo Cadena" desc="Congelaciones masivas eliminan escudos de viento y desprotegen el núcleo interior." />
              {/* Duplicate */}
              <LoopCard type="B1" title="Conservación Endógena Central" desc="Recaudación de energía térmica al moverse al centro asegura capacidad metabólica continua." />
              <LoopCard type="R1" title="Restricción por Incubación" desc="Obligación biomecánica de lentitud en búsqueda reduce salvamento de progenitores expuestos." />
              <LoopCard type="B2" title="Relajo de Frontera" desc="Los agentes nucleares disipan calor abriendo huecos a los perimetrales fríos, un ciclo virtuoso." />
              <LoopCard type="R2" title="Reacción de Hielo Cadena" desc="Congelaciones masivas eliminan escudos de viento y desprotegen el núcleo interior." />
            </div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="landing-card" style={{ textAlign: 'center', padding: '4.5rem 2rem', background: 'linear-gradient(to bottom right, rgba(20, 20, 35, 0.8), rgba(248, 150, 30, 0.1))', border: '1px solid rgba(248, 150, 30, 0.2)' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', fontWeight: 800 }}>Objetivo Evaluativo</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 2.5rem', fontSize: '1.15rem', lineHeight: 1.6 }}>
            Accede al laboratorio paramétrico y ajusta personalmente el tamaño poblacional, temperaturas perimetrales y los límites de la biología pingüino para descubrir el punto límite de quiebre.
          </p>
          <button className="btn btn--primary" style={{ padding: '1rem 2.5rem', fontSize: '1.15rem', borderRadius: '99px', boxShadow: '0 10px 40px rgba(248, 150, 30, 0.3)' }} onClick={() => navigate('/parameters')}>
            Comenzar Análisis Dimensional →
          </button>
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

