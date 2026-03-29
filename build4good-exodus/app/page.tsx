'use client'

import { useState } from 'react'
import ActOne from '@/components/acts/ActOne'
import ActTwo from '@/components/acts/ActTwo'

type Act = 'earth' | 'exoplanet' | 'launch'

export default function Home() {
  const [act, setAct] = useState<Act>('earth')

  return (
    <main className="w-full h-screen overflow-hidden bg-[#0e0e0e]">
      {act === 'earth' && (
        <ActOne onInitiateExodus={() => setAct('exoplanet')} />
      )}
      {act === 'exoplanet' && (
        <ActTwo
          onNavigate={setAct}
          onSelectDestination={() => setAct('launch')}
        />
      )}
    </main>
  )
}