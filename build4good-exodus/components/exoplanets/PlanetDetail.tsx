'use client'

import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { useAppStore } from '@/store/useAppStore'

const TERM_DESCRIPTIONS = {
  cvi: 'Candidate Viability Index. In this app, it is the 0 to 100 score used to summarize how close a planet is to Earth-like size and temperature.',
  ra: 'Right Ascension. A sky coordinate, similar to longitude on Earth, that helps describe where an object appears in space.',
  dec: 'Declination. A sky coordinate, similar to latitude on Earth, that shows how far north or south an object appears in the sky.',
  surfaceTemp: 'Estimated equilibrium temperature in Kelvin. This is a rough way to compare how hot or cold a planet may be.',
  radius: 'Planet size measured in Earth radii. A value of 1 RE means the planet is about the same size as Earth.',
  distance: 'Distance from Earth in light years. One light year is how far light travels in one year.',
  mass: 'Planet mass measured in Earth masses. A value of 1 ME means the planet has about the same mass as Earth.',
  orbitalPeriod: 'How long the planet takes to complete one full orbit around its star. Shorter periods usually mean the planet is closer to its star.',
} as const

export function PlanetDetail({ onSelectDestination }: { onSelectDestination: () => void }) {
  const planet = useAppStore((s) => s.selectedPlanet)

  if (!planet) {
    return (
      <div className="flex h-full w-[300px] shrink-0 items-center justify-center border-l border-stone-800 bg-neutral-800/40">
        <span className="text-xs font-mono uppercase text-stone-600">No target selected</span>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - planet.cvi / 100)

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col overflow-hidden border-l border-stone-800">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto border-b border-stone-800 bg-neutral-700/40 p-6 backdrop-blur">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{planet.name.toUpperCase()}</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] font-mono uppercase tracking-wide text-rose-300">
            <InfoTooltip
              term="RA"
              description={TERM_DESCRIPTIONS.ra}
              textClassName="text-rose-300 hover:text-orange-200"
            >
              RA {planet.ra.toFixed(2)} DEG
            </InfoTooltip>
            <span>/</span>
            <InfoTooltip
              term="DEC"
              description={TERM_DESCRIPTIONS.dec}
              textClassName="text-rose-300 hover:text-orange-200"
            >
              DEC {planet.dec.toFixed(2)} DEG
            </InfoTooltip>
          </p>
        </div>

        <div className="flex items-center justify-center py-2">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center">
            <svg width="120" height="120" className="-rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1c1c1c" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
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
              <span className="text-2xl font-black text-white">{planet.cvi}%</span>
              <InfoTooltip
                term="CVI Score"
                description={TERM_DESCRIPTIONS.cvi}
                textClassName="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-100 hover:text-orange-200"
              >
                CVI SCORE
              </InfoTooltip>
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-stone-800">
          <StatRow label="Surface Temp" description={TERM_DESCRIPTIONS.surfaceTemp} value={`${planet.temp}`} unit="K" />
          <StatRow label="Radius" description={TERM_DESCRIPTIONS.radius} value={`${planet.radius.toFixed(2)}`} unit="RE" />
          <StatRow label="Distance" description={TERM_DESCRIPTIONS.distance} value={`${planet.distanceLy.toLocaleString()}`} unit="LY" />
          {planet.mass != null && (
            <StatRow label="Mass" description={TERM_DESCRIPTIONS.mass} value={`${planet.mass.toFixed(2)}`} unit="ME" />
          )}
          {planet.period != null && (
            <StatRow label="Orbital Period" description={TERM_DESCRIPTIONS.orbitalPeriod} value={`${planet.period.toFixed(1)}`} unit="DAYS" />
          )}
        </div>
      </div>

      <button
        onClick={onSelectDestination}
        className="flex w-full shrink-0 items-center justify-center bg-emerald-500 py-4 transition-colors hover:bg-emerald-400"
      >
        <span className="text-sm font-black uppercase tracking-widest text-green-950">
          SELECT AS DESTINATION
        </span>
      </button>
    </div>
  )
}

function StatRow({
  label,
  description,
  value,
  unit,
}: {
  label: string
  description: string
  value: string
  unit: string
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-[1.15]">
        <InfoTooltip
          term={label}
          description={description}
          textClassName="text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-200 hover:text-orange-200"
        >
          {label}
        </InfoTooltip>
      </div>

      <div className="h-px flex-1 bg-gradient-to-r from-stone-800 via-stone-700/70 to-transparent" />

      <div className="flex min-w-[92px] items-baseline justify-end gap-1 text-right">
        <span className="font-mono text-[22px] font-semibold leading-none text-orange-200">{value}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-orange-200/55">{unit}</span>
      </div>
    </div>
  )
}
