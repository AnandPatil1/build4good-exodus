'use client'
import { StatCard } from '@/components/ui/StatCard'

const stats = [
  {
    label: 'GLOBAL CO2 MEAN',
    value: '421.5',
    unit: 'PPM',
    alert: 'EXCEEDS SAFE THRESHOLD',
    alertColor: 'text-rose-400',
    lineColor: '#f87171',
    trend: 'up' as const,
  },
  {
    label: 'GLOBAL TEMP ANOMALY',
    value: '+1.28',
    unit: '°C',
    alert: 'HEAT INDEX ALERT: DELTA-9',
    alertColor: 'text-rose-400',
    lineColor: '#f87171',
    trend: 'up' as const,
  },
  {
    label: 'ARCTIC SEA ICE EXTENT',
    value: '14.12',
    unit: 'M KM²',
    alert: 'MELT RATE: CRITICAL',
    alertColor: 'text-amber-400',
    lineColor: '#fbbf24',
    trend: 'down' as const,
  },
  {
    label: 'GLOBAL SEA LEVEL RISE',
    value: '+102.5',
    unit: 'MM',
    alert: 'INUNDATION RISK: COASTAL DELTA',
    alertColor: 'text-rose-400',
    lineColor: '#f87171',
    trend: 'up' as const,
  },
]

export function StatPanel() {
  return (
    <div className="w-[340px] shrink-0 h-full flex flex-col border-l border-stone-800 overflow-hidden">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}