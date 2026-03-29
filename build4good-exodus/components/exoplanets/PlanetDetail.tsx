'use client'

import { useAppStore } from '@/store/useAppStore'

export function PlanetDetail({ onSelectDestination }: { onSelectDestination: () => void }) {
  const planet = useAppStore(s => s.selectedPlanet)

  if (!planet) {
    return (
      <div className="w-[300px] shrink-0 h-full bg-neutral-800/40 border-l border-stone-800 flex items-center justify-center">
        <span className="text-stone-600 text-xs font-mono uppercase">No target selected</span>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - planet.habitability / 100)

  return (
    <div className="w-[300px] shrink-0 h-full border-l border-stone-800 flex flex-col overflow-hidden">
      {/* Main card */}
      <div className="flex-1 bg-neutral-700/40 backdrop-blur border-b border-stone-800 p-6 flex flex-col gap-5 overflow-y-auto">
        {/* Planet name */}
        <div>
          <h2 className="text-white text-3xl font-bold tracking-tight">{planet.name}</h2>
          <p className="text-rose-300 text-[10px] font-mono uppercase tracking-wide mt-0.5">
            {planet.constellation} / {planet.starType}
          </p>
        </div>

        {/* Habitability ring */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-[120px] h-[120px] flex items-center justify-center">
            <svg width="120" height="120" className="-rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1c1c1c" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-white text-2xl font-black">{planet.habitability}%</span>
              <span className="text-stone-400 text-[8px] font-mono uppercase tracking-wider">HABITABILITY</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col divide-y divide-stone-800">
          <StatRow label="Surface Temp" value={`${planet.surfaceTemp}`} unit="K" />
          <StatRow label="Orbital Radius" value={`${planet.orbitalRadius}`} unit="RE" />
          <StatRow label="Distance" value={`${planet.distanceLY.toLocaleString()}`} unit="LY" />
        </div>

        {/* Quote */}
        <div className="p-3 bg-emerald-500/5 border-l-2 border-emerald-500">
          <p className="text-stone-300/70 text-[10px] leading-4 font-['Inter']">
            &quot;{planet.quote}&quot;
          </p>
        </div>
      </div>

      {/* Select button */}
      <button
        onClick={onSelectDestination}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-3 shrink-0"
      >
        <span className="text-green-950 text-sm font-black uppercase tracking-widest">
          SELECT AS DESTINATION
        </span>
      </button>
    </div>
  )
}

function StatRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex justify-between items-end py-3">
      <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-orange-200 text-xl font-mono">{value}</span>
        <span className="text-orange-200/60 text-xs font-mono">{unit}</span>
      </div>
    </div>
  )
}