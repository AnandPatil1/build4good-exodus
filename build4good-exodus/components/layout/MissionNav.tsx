'use client'

import { Rocket } from 'lucide-react'

type Act = 'earth' | 'exoplanet' | 'launch'

const TITLE = 'OPERATION EXODUS'

const GLITCH_CUBES = [
  { left: '4%', size: 7, delay: '0s', duration: '1.9s' },
  { left: '16%', size: 10, delay: '0.35s', duration: '2.4s' },
  { left: '29%', size: 6, delay: '0.8s', duration: '1.7s' },
  { left: '42%', size: 12, delay: '0.15s', duration: '2.1s' },
  { left: '56%', size: 8, delay: '0.65s', duration: '2.3s' },
  { left: '69%', size: 9, delay: '0.25s', duration: '1.8s' },
  { left: '82%', size: 6, delay: '0.95s', duration: '2s' },
  { left: '92%', size: 11, delay: '0.5s', duration: '2.5s' },
]

const GLITCH_KEYFRAMES = `
@keyframes navTitleJitterPrimary {
  0%, 100% { transform: translate3d(0, 0, 0); clip-path: inset(0 0 0 0); opacity: 0; }
  18% { transform: translate3d(-1px, 0, 0); clip-path: inset(12% 0 62% 0); opacity: 0.9; }
  34% { transform: translate3d(2px, -1px, 0); clip-path: inset(58% 0 12% 0); opacity: 0.6; }
  52% { transform: translate3d(-3px, 1px, 0); clip-path: inset(32% 0 36% 0); opacity: 0.85; }
  70% { transform: translate3d(1px, 0, 0); clip-path: inset(74% 0 8% 0); opacity: 0.5; }
}
@keyframes navTitleJitterSecondary {
  0%, 100% { transform: translate3d(0, 0, 0); clip-path: inset(0 0 0 0); opacity: 0; }
  22% { transform: translate3d(2px, 0, 0); clip-path: inset(14% 0 56% 0); opacity: 0.55; }
  41% { transform: translate3d(-2px, 1px, 0); clip-path: inset(46% 0 21% 0); opacity: 0.85; }
  63% { transform: translate3d(3px, -1px, 0); clip-path: inset(67% 0 9% 0); opacity: 0.7; }
  79% { transform: translate3d(-1px, 0, 0); clip-path: inset(28% 0 43% 0); opacity: 0.45; }
}
@keyframes navTitleCubeRise {
  0% {
    transform: translate3d(0, 16px, 0) scale(0.5) rotate(0deg);
    opacity: 0;
  }
  18% {
    opacity: 0.95;
  }
  100% {
    transform: translate3d(0, -54px, 0) scale(1.15) rotate(18deg);
    opacity: 0;
  }
}
`

export function MissionNav({ activeAct, onNavigate }: {
  activeAct: Act
  onNavigate?: (act: Act) => void
}) {
  const titles: Record<Act, string> = {
    earth: 'EARTH STATUS',
    exoplanet: 'EXOPLANET SEARCH',
    launch: 'LAUNCH SEQUENCE',
  }
  const navItems: Act[] = ['earth', 'exoplanet', 'launch']

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] px-6 bg-[#171717]/90 backdrop-blur-md border-b border-rose-500/20 flex justify-between items-center overflow-hidden">
      <style>{GLITCH_KEYFRAMES}</style>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/75 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[20px] bg-gradient-to-b from-rose-500/20 via-rose-500/8 to-transparent blur-md pointer-events-none" />
      <div className="group relative flex h-[42px] items-center">
        <div className="relative inline-flex items-center justify-center overflow-visible">
          <span
            className="relative z-[2] text-lg font-black uppercase tracking-widest text-rose-500 transition-all duration-300 group-hover:text-black"
            style={{
              WebkitTextStroke: '1px rgba(251, 113, 133, 0)',
              textShadow: '0 0 0 rgba(248, 113, 113, 0)',
            }}
          >
            <span
              className="transition-all duration-300 group-hover:[text-shadow:0_0_8px_rgba(248,113,113,0.95),0_0_18px_rgba(220,38,38,0.7)]"
              style={{ WebkitTextStroke: '1px rgba(251, 113, 133, 0.95)' }}
            >
              {TITLE}
            </span>
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-[1] text-lg font-black uppercase tracking-widest text-red-500 opacity-0 mix-blend-screen group-hover:opacity-80"
            style={{ animation: 'navTitleJitterPrimary 0.45s steps(2, end) infinite' }}
          >
            {TITLE}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-[1] text-lg font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-70"
            style={{ animation: 'navTitleJitterSecondary 0.55s steps(2, end) infinite' }}
          >
            {TITLE}
          </span>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-6 overflow-visible">
            {GLITCH_CUBES.map((cube, index) => (
              <span
                key={`${cube.left}-${index}`}
                className="absolute bottom-0 opacity-0 group-hover:opacity-100"
                style={{
                  left: cube.left,
                  width: cube.size,
                  height: cube.size,
                  border: '1px solid rgba(248, 113, 113, 0.85)',
                  background: 'rgba(0, 0, 0, 0.78)',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.55), inset 0 0 8px rgba(248, 113, 113, 0.18)',
                  animation: `navTitleCubeRise ${cube.duration} linear ${cube.delay} infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onNavigate?.(item)}
              className={`border-b-2 pb-1 text-xs font-bold uppercase tracking-widest transition-colors ${
                activeAct === item
                  ? 'border-rose-300 text-rose-300'
                  : 'border-transparent text-neutral-600 hover:text-neutral-400'
              }`}
            >
              {titles[item]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center text-rose-300/85">
        <Rocket className="h-5 w-5" strokeWidth={2.2} />
      </div>
    </nav>
  )
}
