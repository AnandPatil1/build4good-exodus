'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { EarthViewer } from '@/components/earth/EarthViewer'
import { MissionNav } from '@/components/layout/MissionNav'
import { SideNav } from '@/components/layout/SideNav'
import { StatPanel } from '@/components/earth/StatPanel'
import { BottomBar } from '@/components/earth/BottomBar'

export default function ActOne({ onInitiateExodus }: { onInitiateExodus: () => void }) {
  return (
    <div className="w-full h-screen bg-neutral-900 flex flex-col overflow-hidden">
      <MissionNav activeAct="earth" />
      <div className="flex flex-1 overflow-hidden pt-16">
        <SideNav activeItem="critical" />
        <EarthViewer />
        <StatPanel />
      </div>
      <BottomBar onInitiate={onInitiateExodus} />
    </div>
  )
}