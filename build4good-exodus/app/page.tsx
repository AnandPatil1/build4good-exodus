'use client'

import { useState } from 'react'
import ActOne from '@/components/acts/ActOne'

type Act = 'earth' | 'exoplanet' | 'launch'

export default function Home() {
  const [act, setAct] = useState<Act>('earth')

  return (
    <main className="w-full h-screen overflow-hidden bg-neutral-900">
      {act === 'earth' && <ActOne onInitiateExodus={() => setAct('exoplanet')} />}
      {/* ActTwo and ActThree coming next */}
    </main>
  )
}