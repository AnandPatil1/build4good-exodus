'use client'

import { EarthViewer } from '@/components/earth/EarthViewer'
import { MissionNav } from '@/components/layout/MissionNav'
import { SideNav } from '@/components/layout/SideNav'
import { StatPanel } from '@/components/earth/StatPanel'
import { BottomBar } from '@/components/earth/BottomBar'
import { StarField } from '@/components/three/StarField'
import { useAppStore } from '@/store/useAppStore'

export default function ActOne({ onInitiateExodus }: { onInitiateExodus: () => void }) {
  const earthView = useAppStore((state) => state.earthView)

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-neutral-900">
      <div className="absolute inset-0">
        <StarField
          interactive={false}
          cameraPosition={earthView.cameraPosition}
          target={earthView.target}
        />
      </div>
      <MissionNav activeAct="earth" />
      <div className="relative z-10 flex flex-1 overflow-hidden pt-16">
        <SideNav activeItem="critical" />
        <EarthViewer />
        <StatPanel />
      </div>
      <div className="relative z-10">
        <BottomBar onInitiate={onInitiateExodus} />
      </div>
    </div>
  )
}
