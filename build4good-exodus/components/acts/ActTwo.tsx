'use client'

import { MissionNav } from '@/components/layout/MissionNav'
import { SideNav } from '@/components/layout/SideNav'
import { FilterPanel } from '@/components/exoplanets/FilterPanel'
import { PlanetDetail } from '@/components/exoplanets/PlanetDetail'
import { StarField } from '@/components/three/StarField'
import { PlanetMesh } from '@/components/three/PlanetMesh'
import { useAppStore } from '@/store/useAppStore'

type Act = 'earth' | 'exoplanet' | 'launch'

export default function ActTwo({
  onNavigate,
  onSelectDestination,
}: {
  onNavigate: (act: Act) => void
  onSelectDestination: () => void
}) {
  const selectedPlanet = useAppStore(s => s.selectedPlanet)

  return (
    <div className="w-full h-screen bg-[#0e0e0e] flex flex-col overflow-hidden">
      <MissionNav activeAct="exoplanet" onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden pt-[60px]">
        <SideNav activeItem="orbital" />
        <FilterPanel />
        {/* Center — star field */}
        <div className="flex-1 h-full relative">
          <StarField>
            <PlanetMesh
              position={[0, 0, 0]}
              radius={2}
              color="#ff8866"
              onClick={() => {}}
              isSelected={true}
            />
            <PlanetMesh
              position={[-12, 3, -5]}
              radius={1.2}
              color="#44dd88"
              onClick={() => {}}
              isSelected={false}
            />
            <PlanetMesh
              position={[10, -4, -8]}
              radius={3}
              color="#8844dd"
              onClick={() => {}}
              isSelected={false}
            />
          </StarField>
          {/* Target lock HUD overlay */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800/80 border-l-2 border-rose-300">
            <span className="text-rose-100 text-[10px] font-mono">TARGET_LOCK: CONFIRMED</span>
          </div>
          <div className="absolute bottom-6 right-1/3 px-2 py-1 bg-neutral-800/80 border-r-2 border-emerald-500">
            <span className="text-emerald-400 text-[10px] font-mono">ATMOS_BREATHABLE: 88%</span>
          </div>
        </div>
        <PlanetDetail onSelectDestination={onSelectDestination} />
      </div>
    </div>
  )
}