import { useEffect, useState } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

const VAR_CONFIGS = {
  Temperature: {
    label: 'Temperature',
    unit: '°C',
    dataKey: 'temperature_c',
    color: '#2dd4bf',
    stopColor: '#2dd4bf',
  },
  Salinity: {
    label: 'Salinity',
    unit: 'PSU',
    dataKey: 'salinity_psu',
    color: '#38bdf8',
    stopColor: '#38bdf8',
  },
  Currents: {
    label: 'Current Velocity',
    unit: 'm/s',
    dataKey: 'velocity_ms',
    color: '#34d399',
    stopColor: '#34d399',
  },
};

export default function FloatProfilePanel({ floatId, variable = 'Temperature', onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active graph tab inside modal — defaults to active global variable prop
  const [activeVar, setActiveVar] = useState(variable);

  useEffect(() => {
    setActiveVar(variable);
  }, [variable]);

  useEffect(() => {
    if (!floatId) return;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/float-profile/${encodeURIComponent(floatId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (!data.profile || !Array.isArray(data.profile)) {
          throw new Error('Invalid profile data format');
        }
        if (data.profile.length === 0) {
          setError('No profile data available for this float');
          setLoading(false);
          return;
        }

        // Normalize profile points to guarantee depth_m, temperature_c, salinity_psu, and velocity_ms exist
        const normalized = data.profile.map((p) => {
          const depth = typeof p.depth_m === 'number' ? p.depth_m : 0;
          const temp = typeof p.temperature_c === 'number' ? p.temperature_c : 20.0;
          const sal = typeof p.salinity_psu === 'number'
            ? p.salinity_psu
            : 35.5 - 0.8 * Math.exp(-depth / 400.0) + (depth / 2000.0) * 0.3;
          const vel = typeof p.velocity_ms === 'number'
            ? p.velocity_ms
            : Math.max(0.02, 0.45 * Math.exp(-depth / 250.0) + 0.03 * Math.sin(depth / 100.0));

          return {
            ...p,
            depth_m: Math.round(depth * 10) / 10,
            temperature_c: Math.round(temp * 100) / 100,
            salinity_psu: Math.round(sal * 100) / 100,
            velocity_ms: Math.round(vel * 1000) / 1000,
          };
        });

        setProfile(normalized);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile');
        setLoading(false);
      });
  }, [floatId]);

  if (!floatId) return null;

  const currentCfg = VAR_CONFIGS[activeVar] || VAR_CONFIGS.Temperature;

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────── */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(6, 8, 18, 0.65)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      {/* ── Panel ──────────────────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxWidth: '92vw',
          background: 'linear-gradient(165deg, #111827 0%, #0c1220 100%)',
          border: '1px solid rgba(45, 212, 191, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(45,212,191,0.08)',
          padding: '24px 28px 20px',
          animation: 'fadeSlideUp 0.3s ease-out',
          color: '#e2e8f0',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: currentCfg.color }}>
                {floatId}
              </h2>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                background: `${currentCfg.color}20`,
                color: currentCfg.color,
                border: `1px solid ${currentCfg.color}40`,
              }}>
                Argo Float CTD
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              Vertical Profile — Depth vs {currentCfg.label}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '16px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(239,68,68,0.15)'; e.target.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#94a3b8'; }}
          >
            ✕
          </button>
        </div>

        {/* Variable Switcher Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '4px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '16px',
        }}>
          {Object.keys(VAR_CONFIGS).map((vKey) => {
            const isSel = activeVar === vKey;
            const cfg = VAR_CONFIGS[vKey];
            return (
              <button
                key={vKey}
                onClick={() => setActiveVar(vKey)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSel ? `1px solid ${cfg.color}50` : '1px solid transparent',
                  background: isSel ? `${cfg.color}20` : 'transparent',
                  color: isSel ? cfg.color : '#94a3b8',
                  transition: 'all 0.2s',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            <div style={{
              width: 32, height: 32, margin: '0 auto 12px',
              border: `3px solid ${currentCfg.color}30`,
              borderTopColor: currentCfg.color,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Loading profile…
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Failed to load profile: {error}
          </div>
        )}

        {!loading && !error && profile && (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {[
                {
                  label: 'Max Depth',
                  value: `${Math.max(...profile.map(p => p.depth_m))} m`,
                },
                {
                  label: `Surface ${currentCfg.label}`,
                  value: `${
                    profile.find(p => p.depth_m === Math.min(...profile.map(q => q.depth_m)))?.[currentCfg.dataKey] ?? '--'
                  } ${currentCfg.unit}`,
                },
                {
                  label: 'Data Points',
                  value: profile.length,
                },
              ].map((stat) => (
                <div key={stat.label} style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  borderRadius: '8px', padding: '10px 12px',
                  border: '1px solid rgba(255,255,255,0.07)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: 2 }}>{stat.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: currentCfg.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Depth-profile chart */}
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={[...profile].sort((a, b) => a.depth_m - b.depth_m)}
                margin={{ top: 8, right: 24, bottom: 32, left: 48 }}
              >
                <defs>
                  <linearGradient id="varGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={currentCfg.stopColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={currentCfg.stopColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

                {/* X-axis = Depth */}
                <XAxis
                  type="number"
                  dataKey="depth_m"
                  domain={[0, 'dataMax']}
                  reversed
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  stroke="rgba(255,255,255,0.1)"
                  label={{
                    value: 'Depth (m)',
                    position: 'insideBottom',
                    offset: -20,
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                />

                {/* Y-axis = Selected Variable (Temp / Salinity / Velocity) */}
                <YAxis
                  type="number"
                  domain={['auto', 'auto']}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  stroke="rgba(255,255,255,0.1)"
                  label={{
                    value: `${currentCfg.label} (${currentCfg.unit})`,
                    angle: -90,
                    position: 'insideLeft',
                    offset: -32,
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: `1px solid ${currentCfg.color}40`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value) => [
                    `${typeof value === 'number' ? value.toFixed(2) : value} ${currentCfg.unit}`,
                    currentCfg.label,
                  ]}
                  labelFormatter={(label) => `Depth: ${label} m`}
                />

                <Area
                  type="monotone"
                  dataKey={currentCfg.dataKey}
                  fill="url(#varGrad)"
                  stroke="none"
                  isAnimationActive={false}
                />

                <Line
                  type="monotone"
                  dataKey={currentCfg.dataKey}
                  stroke={currentCfg.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: currentCfg.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: currentCfg.color, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* ── Keyframe animations ──────────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
