import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
  CartesianGrid, Legend
} from 'recharts';
import { TrendingDown, Thermometer, Zap, Egg } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,14,26,0.95)',
      border: '1px solid rgba(76,201,240,0.2)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: '0.7rem',
      fontFamily: 'var(--font-mono)'
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Día {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function Charts({ stats }) {
  const data = stats?.history || [];
  if (data.length < 2) {
    return (
      <div className="charts-grid">
        {[0,1,2,3].map(i => (
          <div key={i} className="chart-card">
            <div className="no-data">
              <TrendingDown size={20} />
              <span>Datos insuficientes</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Sample data for performance (max 200 points)
  const step = Math.max(1, Math.floor(data.length / 200));
  const sampled = data.filter((_, i) => i % step === 0);

  return (
    <div className="charts-grid">
      {/* Energy curve */}
      <div className="chart-card">
        <div className="chart-card__title">
          <Zap size={14} style={{ color: 'var(--accent-orange)' }} />
          Curva de Energía Promedio
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={sampled}>
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8961e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f8961e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,220,0.08)" />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} />
            <YAxis stroke="var(--text-muted)" fontSize={10} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="avgEnergy" name="Energía %" 
              stroke="#f8961e" fill="url(#energyGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature curve */}
      <div className="chart-card">
        <div className="chart-card__title">
          <Thermometer size={14} style={{ color: 'var(--accent-cyan)' }} />
          Temperatura Corporal vs Ambiental
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={sampled}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,220,0.08)" />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} />
            <YAxis stroke="var(--text-muted)" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '0.65rem' }} />
            <Line type="monotone" dataKey="avgTemp" name="Temp. Corporal" 
              stroke="#4cc9f0" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="temperature" name="Temp. Ambiente" 
              stroke="#7209b7" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Survival */}
      <div className="chart-card">
        <div className="chart-card__title">
          <TrendingDown size={14} style={{ color: 'var(--accent-green)' }} />
          Supervivencia
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={sampled}>
            <defs>
              <linearGradient id="aliveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06d6a0" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06d6a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,220,0.08)" />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} />
            <YAxis stroke="var(--text-muted)" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '0.65rem' }} />
            <Area type="monotone" dataKey="alive" name="Vivos"
              stroke="#06d6a0" fill="url(#aliveGrad)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="dead" name="Muertos"
              stroke="#ef476f" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Egg survival */}
      <div className="chart-card">
        <div className="chart-card__title">
          <Egg size={14} style={{ color: 'var(--accent-yellow)' }} />
          Huevos Viables vs Congelados
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={sampled}>
            <defs>
              <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd166" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ffd166" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,220,0.08)" />
            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} />
            <YAxis stroke="var(--text-muted)" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '0.65rem' }} />
            <Area type="monotone" dataKey="viableEggs" name="Viables"
              stroke="#ffd166" fill="url(#eggGrad)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="eggsFrozen" name="Congelados"
              stroke="#ef476f" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
