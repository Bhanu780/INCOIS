import { useEffect, useState } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area,
} from 'recharts';

const API_BASE = 'http://localhost:8000';

export default function FloatProfilePanel({ floatId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setProfile(data.profile);
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
          width: '560px',
          maxWidth: '92vw',
          background: 'linear-gradient(165deg, #111827 0%, #0c1220 100%)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(45,212,191,0.08)',
          padding: '28px 28px 20px',
          animation: 'fadeSlideUp 0.3s ease-out',
          color: '#e2e8f0',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2dd4bf' }}>
              {floatId}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              Depth – Temperature Profile
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '18px',
              width: '34px',
              height: '34px',
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

        {/* Body */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            <div style={{
              width: 32, height: 32, margin: '0 auto 12px',
              border: '3px solid rgba(45,212,191,0.2)',
              borderTopColor: '#2dd4bf',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Loading profile…
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#f87171' }}>
            ⚠ Failed to load profile: {error}
          </div>
        )}

        {!loading && !error && profile && (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Max Depth', value: `${Math.max(...profile.map(p => p.depth_m))} m` },
                { label: 'Surface Temp', value: `${profile.find(p => p.depth_m === Math.min(...profile.map(q => q.depth_m)))?.temperature_c ?? '--'} °C` },
                { label: 'Data Points', value: profile.length },
              ].map(stat => (
                <div key={stat.label} style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  borderRadius: '8px', padding: '10px 12px',
                  border: '1px solid rgba(255,255,255,0.07)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: 2 }}>{stat.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#2dd4bf' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/*
              Depth-profile chart.
              We treat depth_m as the X-axis (going right = deeper) then flip
              it with `reversed` so depth increases downward — the standard
              oceanographic convention.
              temperature_c is plotted on the Y-axis.
              Both axes use type="number" so recharts treats them as numeric
              scales rather than category labels.
            */}
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={[...profile].sort((a, b) => a.depth_m - b.depth_m)}
                margin={{ top: 8, right: 24, bottom: 32, left: 48 }}
              >
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

                {/* X-axis = Depth (increases to the right, representing going deeper) */}
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

                {/* Y-axis = Temperature */}
                <YAxis
                  type="number"
                  domain={['auto', 'auto']}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  stroke="rgba(255,255,255,0.1)"
                  label={{
                    value: 'Temperature (°C)',
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
                    border: '1px solid rgba(45,212,191,0.25)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value, name) =>
                    name === 'temperature_c'
                      ? [`${typeof value === 'number' ? value.toFixed(2) : value} °C`, 'Temperature']
                      : [value, name]
                  }
                  labelFormatter={(label) => `Depth: ${label} m`}
                />

                <Area
                  type="monotone"
                  dataKey="temperature_c"
                  fill="url(#tempGrad)"
                  stroke="none"
                  isAnimationActive={false}
                />

                <Line
                  type="monotone"
                  dataKey="temperature_c"
                  stroke="#2dd4bf"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2dd4bf', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff', stroke: '#2dd4bf', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* ── Keyframe animations injected once ─────────────────────────── */}
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
