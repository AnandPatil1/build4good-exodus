'use client'

import { getMissionPhase, type LaunchState } from '@/components/launch/launchAnimation'

export function TelemetryDial({
  launchState,
  progress,
}: {
  launchState: LaunchState
  progress: number
}) {
  const progressPercent = launchState === 'arrived' ? 100 : Math.round(progress * 1000) / 10
  const ringValue = launchState === 'idle' ? 0 : progressPercent
  const phase = getMissionPhase(launchState, progress)
  const statusText =
    launchState === 'idle'
      ? 'Awaiting Launch Command'
      : launchState === 'arming'
        ? 'Burn Sequence Engaged'
        : launchState === 'arrived'
          ? 'Destination Vector Locked'
          : 'Interstellar Transfer Active'

  const dialRadius = 92
  const circumference = 2 * Math.PI * dialRadius
  const dashOffset = circumference * (1 - ringValue / 100)
  const needleAngle = (ringValue / 100) * Math.PI * 2 - Math.PI / 2

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#111111]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800 flex flex-col gap-2 shrink-0 bg-[#171717]">
        <span className="text-rose-300 text-[11px] font-black uppercase tracking-wider">Telemetry</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${launchState === 'idle' ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-emerald-500 text-[9px] font-mono uppercase leading-tight">{statusText}</span>
        </div>
      </div>

      {/* Dial */}
      <div className="flex-1 flex items-center justify-center bg-stone-950 px-4 py-6">
        <div className="relative flex items-center justify-center">
          <svg width="220" height="220" className="-rotate-90">
            {/* Background track */}
            <circle
              cx="110" cy="110" r="92"
              fill="none"
              stroke="#27272a"
              strokeWidth="12"
            />
            {/* Progress arc */}
            <circle
              cx="110" cy="110" r="92"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500"
              style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' }}
            />
            {/* Needle */}
            <line
              x1="110" y1="110"
              x2={110 + 76 * Math.cos(needleAngle)}
              y2={110 + 76 * Math.sin(needleAngle)}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>

          {/* Center content */}
          <div className="absolute flex flex-col items-center gap-2">
            <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
              Transfer
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-emerald-400 text-4xl font-black tabular-nums">
                {ringValue.toFixed(1)}
              </span>
              <span className="text-emerald-400 text-xl font-light">%</span>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                {phase}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-3 border-t border-stone-800 bg-[#171717] shrink-0">
        <div className="flex gap-1 mb-2">
          <div className={`flex-1 h-1 ${launchState === 'idle' ? 'bg-stone-800' : 'bg-emerald-500'}`} />
          <div className={`flex-1 h-1 ${launchState === 'inFlight' || launchState === 'arrived' ? 'bg-emerald-500' : 'bg-emerald-500/30'}`} />
          <div className={`flex-1 h-1 ${launchState === 'arrived' ? 'bg-emerald-500' : 'bg-emerald-500/20'}`} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-stone-500 text-[9px] font-mono uppercase">Guidance: {launchState === 'idle' ? 'STANDBY' : 'LOCKED'}</span>
          <span className="text-stone-500 text-[9px] font-mono uppercase">Propulsion: {launchState === 'arrived' ? 'IDLE' : launchState === 'idle' ? 'READY' : 'NOMINAL'}</span>
          <span className="text-stone-500 text-[9px] font-mono uppercase">Progress: {Math.round(ringValue)}%</span>
        </div>
      </div>
    </div>
  )
}
