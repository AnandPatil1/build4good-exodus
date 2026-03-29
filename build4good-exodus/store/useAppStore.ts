import { create } from 'zustand'

export interface Planet {
  id: string
  name: string
  constellation: string
  starType: string
  habitability: number
  surfaceTemp: number
  orbitalRadius: number
  distanceLY: number
  quote: string
}

interface AppStore {
  selectedPlanet: Planet | null
  filters: {
    habitability: number
    planetSize: number
    distanceLY: number
  }
  setSelectedPlanet: (planet: Planet | null) => void
  setFilter: (key: keyof AppStore['filters'], value: number) => void
}

export const useAppStore = create<AppStore>((set) => ({
  selectedPlanet: {
    id: 'kepler-452b',
    name: 'KEPLER-452B',
    constellation: 'Cygnus Constellation',
    starType: 'G2V Star',
    habitability: 92,
    surfaceTemp: 265,
    orbitalRadius: 1.63,
    distanceLY: 1400,
    quote: 'The planet has a high probability of liquid water on its surface, making it the most Earth-like candidate found to date.',
  },
  filters: {
    habitability: 92,
    planetSize: 1.6,
    distanceLY: 1400,
  },
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setFilter: (key, value) => set(s => ({ filters: { ...s.filters, [key]: value } })),
}))