'use client'

import { InfoTooltip } from '@/components/ui/InfoTooltip'

const EARTH_STATS = [
  {
    label: 'Surface Temp',
    value: '288',
    unit: 'K',
    description: 'Earth\'s average surface temperature is about 15°C (288K), maintained by the greenhouse effect.',
  },
  {
    label: 'Radius',
    value: '1.00',
    unit: 'RE',
    description: 'Earth\'s radius is the baseline — 6,371 km. All exoplanet sizes are measured relative to this.',
  },
  {
    label: 'Mass',
    value: '1.00',
    unit: 'ME',
    description: 'Earth\'s mass is the baseline — 5.97 × 10²⁴ kg. All exoplanet masses are measured relative to this.',
  },
  {
    label: 'Orbital Period',
    value: '365.2',
    unit: 'DAYS',
    description: 'Earth takes 365.25 days to complete one orbit around the Sun.',
  },
  {
    label: 'Distance',
    value: '0',
    unit: 'LY',
    description: 'Earth is your origin point. Distance is 0 light years from here.',
  },
  {
    label: 'CVI Score',
    value: '100',
    unit: '%',
    description: 'Earth scores 100% on the Colonial Viability Index — it is the reference against which all candidates are measured.',
  },
] as const

const EARTH_STATUS_TAGS = [
  { label: 'ATMOSPHERE', value: 'N₂ 78% / O₂ 21%', color: 'text-emerald-400' },
  { label: 'HYDROSPHERE', value: '71% SURFACE WATER', color: 'text-blue-400' },
  { label: 'STATUS', value: 'DETERIORATING', color: 'text-rose-400' },
] as const

export function FilterPanel() {
  return (
    <div className="w-[240px] shrink-0 h-full flex flex-col overflow-hidden bg-[#111111] border-r border-rose-500/30 shadow-[1px_0_16px_rgba(244,63,94,0.08)]">

      {/* Header */}
      <div className="px-4 py-3 border-b border-rose-500/20 shrink-0 bg-[#0e0e0e] shadow-[0_1px_0_0_rgba(244,63,94,0.15)]">
        <div className="flex items-center justify-between">
          <span className="text-rose-300 text-xs font-black uppercase tracking-wider">Earth Baseline</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-400 text-[9px] font-mono uppercase">ORIGIN</span>
          </div>
        </div>
      </div>

      {/* Earth name block */}
      <div className="px-4 py-3 border-b border-rose-500/15 bg-stone-900/40 shrink-0 shadow-[0_1px_0_0_rgba(244,63,94,0.10),inset_-1px_0_0_rgba(244,63,94,0.06)]">
        <h2 className="text-white text-xl font-black uppercase tracking-tight leading-tight">
          EARTH
        </h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[9px] font-mono text-rose-300/70 uppercase tracking-wider">SOL SYSTEM</span>
          <span className="text-stone-700 text-[9px]">/</span>
          <span className="text-[9px] font-mono text-rose-300/70 uppercase tracking-wider">SOL-III</span>
        </div>
      </div>

      {/* CVI block — Earth is 100% */}
      <div className="px-4 py-3 border-b shrink-0 bg-[#0e0e0e]"
        style={{
          borderColor: '#f8717130',
          boxShadow: '0 1px 0 0 rgba(248,113,113,0.12), inset 0 0 20px rgba(248,113,113,0.06)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* Ring — full but rose colored to signal danger */}
          <div className="relative w-[88px] h-[88px] shrink-0 flex items-center justify-center">
            <svg width="88" height="88" className="-rotate-90">
              <circle cx="44" cy="44" r="40" fill="none" stroke="#1c1c1c" strokeWidth="6" />
              <circle
                cx="44" cy="44" r="40"
                fill="none"
                stroke="#f87171"
                strokeWidth="6"
                strokeLinecap="butt"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={0}
                style={{ filter: 'drop-shadow(0 0 6px rgba(248,113,113,0.8))' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-black text-white leading-none">100</span>
              <span className="text-[7px] font-bold text-stone-500 uppercase tracking-wider">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              CVI SCORE
            </span>
            <div className="w-full h-0.5 bg-stone-800">
              <div className="h-full w-full bg-rose-400"
                style={{ boxShadow: '0 0 6px #f87171' }} />
            </div>
            <span className="text-[9px] font-mono uppercase text-rose-400">
              REFERENCE WORLD
            </span>
            <div className="px-2 py-0.5 bg-stone-800/80 border border-stone-700/50 inline-flex w-fit"
              style={{ boxShadow: 'inset 0 0 8px rgba(248,113,113,0.1)' }}>
              <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider">
                SOL / CLASS M
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col flex-1 overflow-y-auto divide-y divide-stone-800/60">
        {EARTH_STATS.map(stat => (
          <EarthStatRow key={stat.label} {...stat} />
        ))}

        {/* Status tags */}
        <div className="px-4 py-3 bg-[#0e0e0e] flex flex-col gap-2">
          {EARTH_STATUS_TAGS.map(tag => (
            <div key={tag.label} className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600">
                {tag.label}
              </span>
              <span className={`text-[9px] font-mono uppercase ${tag.color}`}>
                {tag.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-[#0e0e0e]" />
      </div>

      {/* Bottom warning */}
      <div className="px-4 py-3 border-t border-rose-500/20 bg-[#0e0e0e] shrink-0"
        style={{ boxShadow: '0 -4px 20px rgba(248,113,113,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span className="text-[9px] font-mono text-rose-400/70 uppercase leading-4">
            FIND A REPLACEMENT BEFORE THRESHOLD BREACH
          </span>
        </div>
      </div>
    </div>
  )
}

function EarthStatRow({ label, value, unit, description }: {
  label: string
  value: string
  unit: string
  description: string
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