export default function MapPlaceholder() {
  return (
    <div
      className="fixed top-[56px] left-[300px] right-0 bottom-0
                 flex items-center justify-center
                 bg-ocean-900"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{
             backgroundImage:
               'linear-gradient(rgba(34,211,238,.3) 1px, transparent 1px),' +
               'linear-gradient(90deg, rgba(34,211,238,.3) 1px, transparent 1px)',
             backgroundSize: '48px 48px',
           }}
      />

      {/* Loader card */}
      <div className="relative flex flex-col items-center gap-5 select-none">
        {/* Spinning ring */}
        <div className="w-16 h-16 rounded-full border-[3px] border-ocean-700 border-t-accent-cyan animate-spin" />

        <p className="text-lg font-medium text-ocean-300 tracking-wide">
          Map Loading&hellip;
        </p>
        <p className="text-xs text-ocean-500">
          Initializing 3-D Globe &amp; Bathymetry Layers
        </p>
      </div>
    </div>
  );
}
