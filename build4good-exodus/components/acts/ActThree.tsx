'use client'

import { MissionNav } from '@/components/layout/MissionNav'
import { SideNav } from '@/components/layout/SideNav'
import { OrbitalMap } from '@/components/launch/OrbitalMap'
import { TelemetryDial } from '@/components/launch/TelemetryDial'
import { MissionSummary } from '@/components/launch/MissionSummary'

type Act = 'earth' | 'exoplanet' | 'launch'

export default function ActThree({ onNavigate }: { onNavigate: (act: Act) => void }) {
  return (
    <div className="w-full h-screen bg-[#171717] flex flex-col overflow-hidden">
      <MissionNav activeAct="launch" onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden pt-[60px]">
        <SideNav activeItem="critical" />
        {/* Left — orbital map */}
        <div className="w-[380px] shrink-0 h-full border-r border-stone-800 flex flex-col">
          <OrbitalMap />
        </div>
        {/* Center — telemetry dial */}
        <div className="flex-1 h-full border-r border-stone-800 flex flex-col">
          <TelemetryDial />
        </div>
        {/* Right — mission summary */}
        <div className="w-[260px] shrink-0 h-full flex flex-col">
          <MissionSummary />
        </div>
      </div>
    </div>
  )
}
