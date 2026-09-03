/**
 * TimeSlider — play/pause time-step animation component.
 *
 * Blueprint row 7: Backend serves per-timestep grids; frontend plays frames.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTimes } from '../services/api';

// Fallback generate 12 time steps (2-hour intervals) if backend has only 1 snapshot
function generateFallbackTimes() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getTime() - (11 - i) * 2 * 3600 * 1000);
    return d.toISOString();
  });
}

export default function TimeSlider({ onTimeChange, currentTime, className = '' }) {
  const [times, setTimes] = useState(generateFallbackTimes());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(1);
  const intervalRef = useRef(null);

  // Fetch available timesteps from backend
  useEffect(() => {
    fetchTimes()
      .then((data) => {
        if (data && Array.isArray(data.times) && data.times.length >= 2) {
          setTimes(data.times);
        } else {
          setTimes(generateFallbackTimes());
        }
      })
      .catch(() => {
        setTimes(generateFallbackTimes());
      });
  }, []);

  // Notify parent when index changes
  useEffect(() => {
    if (times.length && onTimeChange) {
      onTimeChange(times[currentIdx]);
    }
  }, [currentIdx, times, onTimeChange]);

  // Playback loop
  const startPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % times.length);
    }, 1000 / fps);
  }, [times.length, fps]);

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, startPlayback]);

  const label = times[currentIdx]
    ? new Date(times[currentIdx]).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : 'No data';

  return (
    <section className={className}>
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-ocean-400 mb-2">
        Time Animation
      </h2>

      {/* Current time label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-ocean-400">Time Step</span>
        <span className="px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30
                         text-accent-cyan text-xs font-semibold tabular-nums truncate max-w-[160px]"
              title={times[currentIdx]}>
          {label}
        </span>
      </div>

      {/* Scrubber */}
      <input
        id="time-slider"
        type="range"
        min={0}
        max={Math.max(times.length - 1, 0)}
        step={1}
        value={currentIdx}
        onChange={(e) => {
          setIsPlaying(false);
          setCurrentIdx(Number(e.target.value));
        }}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer
                   bg-ocean-600 accent-accent-cyan
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-accent-cyan
                   [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.5)]
                   [&::-webkit-slider-thumb]:transition-transform
                   [&::-webkit-slider-thumb]:hover:scale-125"
      />

      <div className="flex justify-between text-[10px] text-ocean-500 mt-1 px-0.5">
        <span>Step 1</span>
        <span>{currentIdx + 1} / {times.length}</span>
        <span>Latest</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-2.5">
        {/* Prev */}
        <button
          onClick={() => { setIsPlaying(false); setCurrentIdx((p) => Math.max(0, p - 1)); }}
          className="flex-1 py-1.5 rounded-md bg-ocean-700 border border-ocean-600/40
                     text-ocean-200 text-xs hover:bg-ocean-600 transition-colors
                     flex items-center justify-center gap-1"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M3 10l7-7v5h7v4H10v5z" />
          </svg>
          Prev
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className={`flex-1 py-1.5 rounded-md border text-xs font-semibold
                      transition-all flex items-center justify-center gap-1.5
                      ${isPlaying
                        ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'bg-ocean-700 border-ocean-600/40 text-ocean-200 hover:bg-ocean-600'}`}
        >
          {isPlaying ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6 4l12 6-12 6V4z" />
              </svg>
              Play
            </>
          )}
        </button>

        {/* Next */}
        <button
          onClick={() => { setIsPlaying(false); setCurrentIdx((p) => Math.min(times.length - 1, p + 1)); }}
          className="flex-1 py-1.5 rounded-md bg-ocean-700 border border-ocean-600/40
                     text-ocean-200 text-xs hover:bg-ocean-600 transition-colors
                     flex items-center justify-center gap-1"
        >
          Next
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M17 10l-7 7v-5H3V8h7V3z" />
          </svg>
        </button>
      </div>

      {/* FPS control */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-ocean-400">
        <span>Speed</span>
        <div className="flex gap-1">
          {[0.5, 1, 2, 4].map((f) => (
            <button
              key={f}
              onClick={() => setFps(f)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors
                ${fps === f
                  ? 'bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan'
                  : 'bg-ocean-700 border border-ocean-600/30 text-ocean-400 hover:text-white'}`}
            >
              {f}×
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
