'use client'

import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { useAppStore } from '@/store/useAppStore'

const TERM_DESCRIPTIONS = {
  ra: 'Right Ascension. A sky coordinate similar to longitude on Earth.',
  dec: 'Declination. A sky coordinate similar to latitude on Earth.',
  surfaceTemp: 'Estimated equilibrium temperature in Kelvin.',
  radius: 'Planet size in Earth radii. 1 RE = same size as Earth.',
  distance: 'Distance from Earth in light years.',
  mass: 'Planet mass in Earth masses. 1 ME = same mass as Earth.',
  orbitalPeriod: 'Time for one full orbit around its star, in days.',
} as const

// Normalize each stat to a 0-1 score where 1.0 = Earth baseline (ideal)
// For distance, closer = better so we invert it
function normalize(value: number | null, earthValue: number, maxDelta: number, invert = false): number {
  if (value === null) return 0.5 // unknown = middle
  if (invert) {
    // closer to 0 = better, cap at maxDelta
    return Math.max(0, 1 - Math.min(value, maxDelta) / maxDelta)
  }
  // closer to earthValue = better
  const delta = Math.abs(value - earthValue)
  return Math.max(0, 1 - delta / maxDelta)
}

interface RadarPoint {
  label: string
  earth: number
  planet: number
}

function buildRadarPoints(planet: {
  temp: number
  radius: number
  mass: number | null
  period: number | null
  distanceLy: number
}, earthTemp: number): RadarPoint[] {
  return [
    {
      label: 'TEMP',
      earth: 1.0,
      planet: normalize(planet.temp, earthTemp, 200),
    },
    {
      label: 'RADIUS',
      earth: 1.0,
      planet: normalize(planet.radius, 1.0, 1.5),
    },
    {
      label: 'MASS',
      earth: 1.0,
      planet: normalize(planet.mass, 1.0, 9),
    },
    {
      label: 'PERIOD',
      earth: 1.0,
      planet: normalize(planet.period, 365, 700),
    },
    {
      label: 'DISTANCE',
      earth: 1.0,
      planet: normalize(planet.distanceLy, 0, 2000, true),
    },
  ]
}

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function pointsToPath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z'
}

interface RadarChartProps {
  points: RadarPoint[]
}

function RadarChart({ points }: RadarChartProps) {
  const cx = 110
  const cy = 100
  const maxR = 72
  const levels = 4
  const total = points.length

  // Grid rings
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = (maxR * (i + 1)) / levels
    const ringPoints = Array.from({ length: total }, (_, j) => polarToCartesian(cx, cy, r, j, total))
    return pointsToPath(ringPoints)
  })

  // Axis lines
  const axes = Array.from({ length: total }, (_, i) => {
    const outer = polarToCartesian(cx, cy, maxR, i, total)
    return { x1: cx, y1: cy, x2: outer.x, y2: outer.y }
  })

  // Label positions (slightly outside maxR)
  const labels = points.map((p, i) => {
    const pos = polarToCartesian(cx, cy, maxR + 16, i, total)
    return { ...pos, label: p.label }
  })

  // Earth polygon
  const earthPolygon = points.map((p, i) =>
    polarToCartesian(cx, cy, maxR * p.earth, i, total)
  )

  // Planet polygon
  const planetPolygon = points.map((p, i) =>
    polarToCartesian(cx, cy, maxR * p.planet, i, total)
  )

  return (
    <svg width="220" height="200" viewBox="0 0 220 200" className="w-full">
      {/* Grid rings */}
      {gridRings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#27272a" strokeWidth="0.5" />
      ))}

      {/* Axis lines */}
      {axes.map((a, i) => (
        <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
          stroke="#3f3f46" strokeWidth="0.5" />
      ))}

      {/* Earth fill */}
      <path
        d={pointsToPath(earthPolygon)}
        fill="rgba(244,63,94,0.12)"
        stroke="#f43f5e"
        strokeWidth="1.5"
        style={{ filter: 'drop-shadow(0 0 4px rgba(244,63,94,0.4))' }}
      />

      {/* Planet fill */}
      <path
        d={pointsToPath(planetPolygon)}
        fill="rgba(16,185,129,0.12)"
        stroke="#10b981"
        strokeWidth="1.5"
        style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.4))' }}
      />

      {/* Earth dots */}
      {earthPolygon.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#f43f5e"
          style={{ filter: 'drop-shadow(0 0 3px rgba(244,63,94,0.8))' }} />
      ))}

      {/* Planet dots */}
      {planetPolygon.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#10b981"
          style={{ filter: 'drop-shadow(0 0 3px rgba(16,185,129,0.8))' }} />
      ))}

      {/* Labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
          fill="#78716c"
          letterSpacing="0.08em"
        >
          {l.label}
        </text>
      ))}

      {/* Legend */}
      <g transform="translate(8, 182)">
        <rect width="8" height="2" fill="#f43f5e" rx="1" />
        <text x="11" y="1.5" fontSize="7" fill="#f43f5e" fontFamily="monospace"
          dominantBaseline="middle" fontWeight="bold">EARTH</text>
      </g>
      <g transform="translate(70, 182)">
        <rect width="8" height="2" fill="#10b981" rx="1" />
        <text x="11" y="1.5" fontSize="7" fill="#10b981" fontFamily="monospace"
          dominantBaseline="middle" fontWeight="bold">TARGET</text>
      </g>
    </svg>
  )
}

export function PlanetDetail({ onSelectDestination }: { onSelectDestination: () => void }) {
  const planet = useAppStore((s) => s.selectedPlanet)
  const earthRegression = useAppStore((s) => s.earthRegression)
  const elapsedYears = useAppStore((s) => s.elapsedYears)

  // Dynamic Earth temp — projected forward using regression + elapsed years
  const earthTemp = (() => {
    if (!earthRegression) return 288
    const coeff = earthRegression.coefficients.T2M
    if (coeff.slope === null || coeff.intercept === null) return 288
    const futureX = 120 + Math.round(elapsedYears * 12)
    // T2M is in °C, convert to K
    return (coeff.intercept + coeff.slope * futureX) + 273.15
  })()

  if (!planet) {
    return (
      <div className="flex h-full w-[300px] shrink-0 flex-col bg-[#111111] border-l border-rose-500/30 shadow-[-1px_0_12px_rgba(244,63,94,0.08)]">
        <div className="px-4 py-3 border-b border-rose-500/20 shrink-0 bg-[#0e0e0e] shadow-[0_1px_0_0_rgba(244,63,94,0.15)]">
          <span className="text-rose-300 text-xs font-black uppercase tracking-wider">Target Analysis</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border border-stone-700 flex items-center justify-center">
              <span className="text-stone-600 text-lg">◎</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-600">
              NO TARGET SELECTED
            </span>
            <span className="text-[9px] font-mono text-stone-700 uppercase">
              CLICK PLANET TO LOCK
            </span>
          </div>
        </div>
      </div>
    )
  }

  const radarPoints = buildRadarPoints(planet, earthTemp)

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col overflow-hidden bg-[#111111] border-l border-rose-500/30 shadow-[-1px_0_16px_rgba(244,63,94,0.08)]">

      {/* Header */}
      <div className="px-4 py-3 border-b border-rose-500/20 shrink-0 bg-[#0e0e0e] shadow-[0_1px_0_0_rgba(244,63,94,0.15)]">
        <div className="flex items-center justify-between">
          <span className="text-rose-300 text-xs font-black uppercase tracking-wider">Target Analysis</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-500 text-[9px] font-mono uppercase">LOCKED</span>
          </div>
        </div>
      </div>

      {/* Planet name */}
      <div className="px-4 py-3 border-b border-rose-500/15 bg-stone-900/40 shrink-0 shadow-[0_1px_0_0_rgba(244,63,94,0.10),inset_1px_0_0_rgba(244,63,94,0.06)]">
        <h2 className="text-white text-xl font-black uppercase tracking-tight leading-tight">
          {planet.name}
        </h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <InfoTooltip term="RA" description={TERM_DESCRIPTIONS.ra}
            textClassName="text-[9px] font-mono text-rose-300/70 hover:text-orange-200 uppercase tracking-wider">
            RA {planet.ra.toFixed(2)}°
          </InfoTooltip>
          <span className="text-stone-700 text-[9px]">/</span>
          <InfoTooltip term="DEC" description={TERM_DESCRIPTIONS.dec}
            textClassName="text-[9px] font-mono text-rose-300/70 hover:text-orange-200 uppercase tracking-wider">
            DEC {planet.dec.toFixed(2)}°
          </InfoTooltip>
        </div>
      </div>

      {/* Radar chart */}
      <div className="px-4 py-3 border-b border-emerald-500/20 shrink-0 bg-[#0e0e0e]"
        style={{ boxShadow: '0 1px 0 0 rgba(16,185,129,0.12), inset 0 0 20px rgba(16,185,129,0.04)' }}>
        <div className="text-[9px] font-mono text-stone-600 uppercase tracking-wider mb-2">
          VS EARTH BASELINE — {earthTemp.toFixed(1)}K
        </div>
        <RadarChart points={radarPoints} />
      </div>

      {/* Stats */}
      <div className="flex flex-col flex-1 overflow-y-auto divide-y divide-stone-800/60">
        <StatRow label="Surface Temp" description={TERM_DESCRIPTIONS.surfaceTemp} value={`${planet.temp}`} unit="K" />
        <StatRow label="Radius" description={TERM_DESCRIPTIONS.radius} value={`${planet.radius.toFixed(2)}`} unit="RE" />
        <StatRow label="Distance" description={TERM_DESCRIPTIONS.distance} value={`${planet.distanceLy.toLocaleString()}`} unit="LY" />
        {planet.mass != null && (
          <StatRow label="Mass" description={TERM_DESCRIPTIONS.mass} value={`${planet.mass.toFixed(2)}`} unit="ME" />
        )}
        {planet.period != null && (
          <StatRow label="Orbital Period" description={TERM_DESCRIPTIONS.orbitalPeriod} value={`${planet.period.toFixed(1)}`} unit="DAYS" />
        )}
        <div className="flex-1 bg-[#0e0e0e]" />
      </div>

      {/* Select button */}
      <button
        onClick={onSelectDestination}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 transition-all shrink-0 border-t-2 border-emerald-400"
        style={{ boxShadow: '0 -4px 20px rgba(16,185,129,0.25)' }}
      >
        <span className="text-green-950 text-sm font-black uppercase tracking-widest">
          SELECT AS DESTINATION
        </span>
      </button>
    </div>
  )
}

function StatRow({ label, description, value, unit }: {
  label: string
  description: string
  value: string
  unit: string
}) {
  return (
    <div className="px-4 py-3 bg-[#111111] flex items-center justify-between gap-2 hover:bg-stone-900/40 transition-colors">
      <InfoTooltip term={label} description={description}
        textClassName="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-orange-200">
        {label}
      </InfoTooltip>
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="text-2xl font-black font-mono text-orange-200 leading-none">{value}</span>
        <span className="text-[10px] font-mono text-orange-200/50 uppercase tracking-wider">{unit}</span>
      </div>
    </div>
  )
}