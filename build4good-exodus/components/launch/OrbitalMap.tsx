'use client'

import { useAppStore } from '@/store/useAppStore'

export function OrbitalMap() {
  const planet = useAppStore(s => s.selectedPlanet)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800 flex justify-between items-center shrink-0">
        <span className="text-rose-300 text-xs font-black uppercase tracking-wider">Orbital Dynamics Map</span>
        <span className="text-stone-500 text-[10px] font-mono">SECTOR: 04-G</span>
      </div>

      {/* Orrery */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <OrreryCanvas planetName={planet?.name ?? 'KEPLER-452B'} />
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 border-t border-stone-800 bg-stone-900 shrink-0 grid grid-cols-2 gap-3">
        <div>
          <div className="text-stone-500 text-[9px] font-bold uppercase tracking-wide">Relative Velocity</div>
          <div className="text-stone-200 text-sm font-mono mt-0.5">42,190 KM/S</div>
        </div>
        <div>
          <div className="text-stone-500 text-[9px] font-bold uppercase tracking-wide">Fuel Reserve</div>
          <div className="text-stone-200 text-sm font-mono mt-0.5">98.4% [PT-4]</div>
        </div>
      </div>
    </div>
  )
}

function OrreryCanvas({ planetName }: { planetName: string }) {
  const cx = 160
  const cy = 160
  const orbits = [32, 56, 96, 128]

  return (
    <svg width="320" height="320" viewBox="0 0 320 320">
      {/* Orbit rings */}
      {orbits.map((r, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#404040"
          strokeWidth="0.5"
        />
      ))}

      {/* Sun */}
      <circle cx={cx} cy={cy} r={3} fill="#fde68a" />

      {/* Earth — on 3rd orbit */}
      <circle cx={cx - orbits[2]} cy={cy} r={4} fill="#fcd34d" />

      {/* Second planet on 2nd orbit */}
      <circle cx={cx + orbits[1] * 0.7} cy={cy - orbits[1] * 0.7} r={3} fill="#d6d3d1" />

      {/* Launch trajectory arc */}
      <path
        d={`M ${cx - orbits[2]} ${cy} Q ${cx + 60} ${cy - 180} ${cx + orbits[3] * 0.85} ${cy - orbits[3] * 0.5}`}
        fill="none"
        stroke="#10b981"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.8"
      />

      {/* Target destination dot */}
      <circle
        cx={cx + orbits[3] * 0.85}
        cy={cy - orbits[3] * 0.5}
        r={3}
        fill="#10b981"
      />

      {/* Target label */}
      <text
        x={cx + orbits[3] * 0.85 + 8}
        y={cy - orbits[3] * 0.5 - 10}
        fill="#10b981"
        fontSize="7"
        fontFamily="monospace"
        fontWeight="bold"
      >
        TARGET DESTINATION
      </text>
      <text
        x={cx + orbits[3] * 0.85 + 8}
        y={cy - orbits[3] * 0.5 + 2}
        fill="#e7e5e4"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {planetName}
      </text>

      {/* Origin label */}
      <text
        x={cx - orbits[2] - 8}
        y={cy + 20}
        fill="#fda4af"
        fontSize="7"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="end"
      >
        ORIGIN VECTOR
      </text>
      <text
        x={cx - orbits[2] - 8}
        y={cy + 30}
        fill="#e7e5e4"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="end"
      >
        SOL / EARTH
      </text>
    </svg>
  )
}