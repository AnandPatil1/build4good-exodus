'use client'

import { getMissionPhase, type LaunchState } from '@/components/launch/launchAnimation'
import { useAppStore } from '@/store/useAppStore'

export function MissionSummary({
  launchState,
  progress,
  onLaunch,
  onReplay,
}: {
  launchState: LaunchState
  progress: number
  onLaunch: () => void
  onReplay: () => void
}) {
  const planet = useAppStore(s => s.selectedPlanet)
  const missionPhase = getMissionPhase(launchState, progress)
  const progressPercent = launchState === 'arrived' ? 100 : Math.round(progress * 100)

  return (
    <div className="flex-1 flex flex-col overflow-hidden border-l border-stone-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800 shrink-0">
        <span className="text-rose-300 text-xs font-black uppercase tracking-wider">Mission Summary</span>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Destination card */}
        <div className="p-4 bg-stone-900 border-l-4 border-orange-200">
          <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-2">
            Destination Profile
          </div>
          {planet ? (
            <div className="flex justify-between items-end">
              <div>
                <div className="text-stone-100 text-xl font-black leading-tight">{planet.name.toUpperCase()}</div>
                <div className="text-orange-200 text-xs mt-0.5">RA {planet.ra.toFixed(1)}° DEC {planet.dec.toFixed(1)}°</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 text-lg font-bold">{planet.cvi}%</div>
                <div className="text-stone-500 text-[9px] uppercase font-bold">Habitability</div>
              </div>
            </div>
          ) : (
            <div className="text-stone-500 text-xs font-mono uppercase tracking-wide">
              No destination selected in Act Two
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col border border-stone-800 divide-y divide-stone-800">
          <MiniStat label="Mission Phase" value={missionPhase} />
          <MiniStat label="Transfer Progress" value={`${progressPercent}%`} />
          <MiniStat label="Distance" value={planet ? `${planet.distanceLy.toLocaleString()} LY` : '--'} />
        </div>
      </div>

      {/* Confirm launch button */}
      <div className="p-4 bg-stone-900 border-t border-stone-800 shrink-0 flex flex-col gap-3">
        <button
          type="button"
          onClick={launchState === 'arrived' ? onReplay : onLaunch}
          disabled={!planet || launchState === 'arming' || launchState === 'inFlight'}
          className={`w-full py-4 font-black text-base uppercase tracking-widest transition-all ${
            !planet
              ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
              : launchState === 'arming' || launchState === 'inFlight'
                ? 'bg-emerald-700 text-emerald-200 cursor-default'
                : 'bg-emerald-500 text-green-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
          }`}
        >
          {!planet
            ? 'SELECT A DESTINATION'
            : launchState === 'arrived'
              ? 'LANDED'
              : launchState === 'arming' || launchState === 'inFlight'
                ? 'LAUNCH'
                : 'LAUNCH'}
        </button>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3 bg-stone-900">
      <div className="text-stone-500 text-[9px] font-bold uppercase tracking-wide">{label}</div>
      <div className="text-stone-100 text-lg font-mono mt-0.5">{value}</div>
    </div>
  )
}
