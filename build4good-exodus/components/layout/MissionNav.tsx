'use client'

type Act = 'earth' | 'exoplanet' | 'launch'

export function MissionNav({ activeAct, onNavigate }: {
  activeAct: Act
  onNavigate?: (act: Act) => void
}) {
  const tabs: { id: Act; label: string }[] = [
    { id: 'earth', label: 'EARTH STATUS' },
    { id: 'exoplanet', label: 'EXOPLANET SEARCH' },
    { id: 'launch', label: 'LAUNCH SEQUENCE' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] px-6 bg-[#171717]/90 backdrop-blur-md border-b border-rose-500/20 flex justify-between items-center overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/75 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[20px] bg-gradient-to-b from-rose-500/20 via-rose-500/8 to-transparent blur-md pointer-events-none" />
      <span className="text-rose-500 text-lg font-black uppercase tracking-widest">
        OPERATION EXODUS
      </span>
      <div className="flex items-center gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onNavigate?.(tab.id)}
            className={`text-xs font-bold uppercase tracking-widest pb-1 transition-colors border-b-2 ${
              activeAct === tab.id
                ? 'text-rose-300 border-rose-300'
                : 'text-neutral-600 border-transparent hover:text-neutral-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        {['grid', 'wifi', 'user'].map(icon => (
          <div key={icon} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 cursor-pointer">
            <div className="w-4 h-4 border border-rose-300/60 rounded-sm" />
          </div>
        ))}
      </div>
    </nav>
  )
}
