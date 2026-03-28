'use client'

const items = [
  { id: 'orbital', label: 'ORBITAL', icon: '◎' },
  { id: 'atmos', label: 'ATMOS', icon: '≋' },
  { id: 'critical', label: 'CRITICAL', icon: '!' },
  { id: 'logs', label: 'LOGS', icon: '≡' },
  { id: 'config', label: 'CONFIG', icon: '⚙' },
]

export function SideNav({ activeItem }: { activeItem: string }) {
  return (
    <div className="w-[60px] h-full bg-[#171717] border-r border-neutral-800 flex flex-col items-center py-4 gap-1 shrink-0">
      {items.map(item => {
        const isActive = item.id === activeItem
        return (
          <div
            key={item.id}
            className={`w-full py-3 flex flex-col items-center gap-1 cursor-pointer relative ${
              isActive ? 'bg-stone-900' : 'hover:bg-neutral-800/40'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-300" />
            )}
            <span className={`text-sm ${isActive ? 'text-rose-300' : 'text-neutral-700'}`}>
              {item.icon}
            </span>
            <span className={`text-[7px] font-bold uppercase tracking-wider ${
              isActive ? 'text-rose-300' : 'text-neutral-700'
            }`}>
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}