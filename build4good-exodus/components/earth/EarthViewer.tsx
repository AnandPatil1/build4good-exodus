'use client'

export function EarthViewer() {
  return (
    <div className="flex-1 h-full bg-[#0c0a09] relative flex items-center justify-center overflow-hidden">
      {/* Crosshair lines */}
      <div className="absolute w-full h-px bg-rose-300/10 top-1/2" />
      <div className="absolute h-full w-px bg-rose-300/10 left-1/2" />

      {/* Outer rings */}
      <div className="absolute w-[580px] h-[580px] rounded-full border border-rose-300/15 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full border border-rose-300/10 pointer-events-none" />

      {/* Earth */}
      <div className="relative z-10">
        <div className="w-[380px] h-[380px] rounded-full overflow-hidden relative shadow-[0_0_100px_rgba(239,68,68,0.25)]">
          <img
            src="https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg"
            alt="Earth"
            className="w-full h-full object-cover scale-150 translate-x-[-10%]"
            onError={(e) => {
              // fallback to a CSS Earth
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          {/* CSS fallback Earth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-green-800 rounded-full" />
          {/* Red tint overlay */}
          <div className="absolute inset-0 bg-rose-900/20 rounded-full" />
          {/* Critical Warning Banner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-rose-500 px-5 py-1.5 -rotate-3 shadow-xl shadow-rose-500/30">
              <span className="text-white text-xl font-black uppercase tracking-widest">
                CRITICAL WARNING
              </span>
            </div>
          </div>
        </div>
        {/* Pulse rings */}
        <div
          className="absolute inset-0 rounded-full border-2 border-rose-500/30 scale-110 animate-ping"
          style={{ animationDuration: '2.5s' }}
        />
        <div
          className="absolute inset-0 rounded-full border border-rose-500/15 scale-125 animate-ping"
          style={{ animationDuration: '2.5s', animationDelay: '0.4s' }}
        />
      </div>

      {/* Top right sector info */}
      <div className="absolute top-3 right-4 text-right text-[10px] text-stone-500 font-mono leading-5">
        <div>SECTOR: SOL-03</div>
        <div>STATUS: UNSTABLE</div>
      </div>

      {/* Bottom left coords */}
      <div className="absolute bottom-3 left-4 text-[10px] text-rose-300/50 font-mono leading-5">
        <div>34.0522° N</div>
        <div>118.2437° W</div>
        <div>408,000 M</div>
      </div>
    </div>
  )
}