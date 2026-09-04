export default function Navbar({ onOutreachClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-[56px] z-50 flex items-center justify-between px-6
                     bg-ocean-800/80 backdrop-blur-lg border-b border-ocean-600/50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        {/* Animated wave icon */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent-cyan/20 animate-ping" />
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent-cyan relative" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12c1.5-3 4-5 6-5s4.5 2 6 5 4 5 6 5" strokeLinecap="round" />
            <path d="M2 17c1.5-3 4-5 6-5s4.5 2 6 5 4 5 6 5" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>

        <h1 className="flex min-w-0 items-baseline gap-2 text-lg font-semibold tracking-wide">
          <span className="shrink-0 text-accent-cyan">Apna Sagar</span>
          <span className="truncate text-sm font-medium text-ocean-200 sm:text-base">Indian Ocean Explorer</span>
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Ocean Explorer / Outreach mode */}
        <button
          id="outreach-mode-btn"
          onClick={onOutreachClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg
                     bg-ocean-700/60 border border-ocean-600/40
                     text-xs font-medium text-ocean-200 hover:text-white hover:bg-ocean-700
                     transition-all hover:border-accent-cyan/40 shadow-sm"
        >
          <svg className="w-4 h-4 text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="hidden sm:inline">Ocean Explorer</span>
        </button>

        {/* Live status badge */}
        <div className="flex items-center gap-2 text-xs text-ocean-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-teal" />
          </span>
          Live Data
        </div>
      </div>
    </nav>
  );
}
