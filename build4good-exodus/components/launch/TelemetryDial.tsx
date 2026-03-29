'use client'

import { useState, useEffect } from 'react'

export function TelemetryDial() {
  const [viability, setViability] = useState(98.4)

  // Subtle fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViability(v => {
        const delta = (Math.random() - 0.5) * 0.4
        return Math.min(100, Math.max(90, v + delta))
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])

  const circumference = 2 * Math.PI * 140
  const dashOffset = circumference * (1 - viability / 100)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800 flex justify-between items-center shrink-0 bg-[#171717]">
        <span className="text-rose-300 text-xs font-black uppercase tracking-wider">Telemetry Dashboard</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 text-[10px] font-mono uppercase">Live Connection Stable</span>
        </div>
      </div>

      {/* Dial */}
      <div className="flex-1 flex items-center justify-center bg-stone-950">
        <div className="relative flex items-center justify-center">
          <svg width="320" height="320" className="-rotate-90">
            {/* Background track */}
            <circle
              cx="160" cy="160" r="140"
              fill="none"
              stroke="#27272a"
              strokeWidth="16"
            />
            {/* Progress arc */}
            <circle
              cx="160" cy="160" r="140"
              fill="none"
              stroke="#10b981"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500"
              style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' }}
            />
            {/* Needle */}
            <line
              x1="160" y1="160"
              x2={160 + 120 * Math.cos((viability / 100) * Math.PI * 2 - Math.PI / 2)}
              y2={160 + 120 * Math.sin((viability / 100) * Math.PI * 2 - Math.PI / 2)}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>

          {/* Center content */}
          <div className="absolute flex flex-col items-center gap-2">
            <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
              Launch Window Viability
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-emerald-400 text-6xl font-black tabular-nums">
                {viability.toFixed(1)}
              </span>
              <span className="text-emerald-400 text-2xl font-light">%</span>
            </div>
            <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-emerald-400 text-sm font-black uppercase tracking-[0.2em]">
                GO FOR LAUNCH
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="px-6 py-3 border-t border-stone-800 bg-[#171717] shrink-0">
        <div className="flex gap-1 mb-2">
          <div className="flex-1 h-1 bg-emerald-500" />
          <div className="flex-1 h-1 bg-emerald-500" />
          <div className="flex-1 h-1 bg-emerald-500/30" />
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500 text-[9px] font-mono uppercase">Gravity Assist: READY</span>
          <span className="text-stone-500 text-[9px] font-mono uppercase">Propulsion: NOMINAL</span>
          <span className="text-stone-500 text-[9px] font-mono uppercase">Stellar Winds: FAIR</span>
        </div>
      </div>
    </div>
  )
}