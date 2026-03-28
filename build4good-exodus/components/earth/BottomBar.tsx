'use client'

import { useState, useEffect } from 'react'

// Starting at 2 hours for drama
const START_SECONDS = 2 * 60 * 60

export function BottomBar({ onInitiate }: { onInitiate: () => void }) {
  const [totalMs, setTotalMs] = useState(START_SECONDS * 1000)

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalMs(prev => Math.max(0, prev - 10))
    }, 10)
    return () => clearInterval(interval)
  }, [])

  const h = Math.floor(totalMs / 3600000)
  const m = Math.floor((totalMs % 3600000) / 60000)
  const s = Math.floor((totalMs % 60000) / 1000)
  const ms = Math.floor((totalMs % 1000) / 10)
  const fmt = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="h-[60px] px-6 bg-[#171717] border-t border-stone-800 flex items-center justify-between shrink-0">
      <div className="text-[10px] text-rose-300/50 font-mono leading-5">
        <div>TO CRITICAL THRESHOLD</div>
        <div>EXTINCTION EVENT HORIZON CALCULATION: ACTIVE</div>
      </div>

      <div className="text-4xl font-black text-rose-400 tabular-nums tracking-wider">
        {fmt(h)}:{fmt(m)}:{fmt(s)}:{fmt(ms)}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onInitiate}
          className="px-5 py-2 border border-stone-600 text-stone-200 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          INITIATE EXODUS
        </button>
        <button className="px-5 py-2 border border-stone-800 text-stone-600 text-xs font-bold uppercase tracking-widest hover:bg-stone-900 transition-colors">
          OVERRIDE
        </button>
      </div>
    </div>
  )
}