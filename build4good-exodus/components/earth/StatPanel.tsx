'use client'

import { useEffect } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { useAppStore } from '@/store/useAppStore'
import type { EarthRegression, EarthSeries } from '@/store/useAppStore'
import { computeFirstBreach } from '@/lib/threshold'

function project(coeff: { slope: number | null; intercept: number | null }, atX: number): number | null {
  if (coeff.slope === null || coeff.intercept === null) return null
  return coeff.intercept + coeff.slope * atX
}

function fmt(val: number | null, decimals = 1): string {
  if (val === null) return '-'
  return val.toFixed(decimals)
}

function buildStats(r: EarthRegression, s: EarthSeries, elapsedYears: number) {
  const futureX = 120 + Math.round(elapsedYears * 12)

  return [
    {
      label: 'TEMP AT 2M',
      description: 'Estimated air temperature measured about 2 meters above the ground. It is a standard climate reading because it closely reflects conditions people and ecosystems experience.',
      value: fmt(project(r.coefficients.T2M, futureX)),
      unit: 'C',
      alert: (r.coefficients.T2M.slope ?? 0) > 0 ? 'WARMING TREND DETECTED' : 'COOLING TREND',
      alertColor: (r.coefficients.T2M.slope ?? 0) > 0 ? 'text-rose-400' : 'text-blue-400',
      lineColor: '#f87171',
      trend: ((r.coefficients.T2M.slope ?? 0) > 0 ? 'up' : 'down') as 'up' | 'down',
      series: s.T2M,
    },
    {
      label: 'PRECIPITATION',
      description: 'The amount of rain, snow, or other water falling from the atmosphere. Lower values can signal drier conditions, while higher values point to wetter conditions.',
      value: fmt(project(r.coefficients.PRECTOTCORR, futureX)),
      unit: 'MM/DAY',
      alert: (r.coefficients.PRECTOTCORR.slope ?? 0) > 0 ? 'RAINFALL INCREASING' : 'DROUGHT RISK RISING',
      alertColor: (r.coefficients.PRECTOTCORR.slope ?? 0) > 0 ? 'text-blue-400' : 'text-amber-400',
      lineColor: '#60a5fa',
      trend: ((r.coefficients.PRECTOTCORR.slope ?? 0) > 0 ? 'up' : 'down') as 'up' | 'down',
      series: s.PRECTOTCORR,
    },
    {
      label: 'RELATIVE HUMIDITY',
      description: 'How much moisture is in the air compared with the maximum it could hold at that temperature. Higher humidity usually means the air feels more damp and heavy.',
      value: fmt(project(r.coefficients.RH2M, futureX)),
      unit: '%',
      alert: 'ATMOSPHERIC MOISTURE TRACKED',
      alertColor: 'text-stone-400',
      lineColor: '#a78bfa',
      trend: ((r.coefficients.RH2M.slope ?? 0) > 0 ? 'up' : 'down') as 'up' | 'down',
      series: s.RH2M,
    },
    {
      label: 'WIND SPEED',
      description: 'How fast air is moving near the surface. Wind speed affects storms, fire behavior, evaporation, and how conditions feel outdoors.',
      value: fmt(project(r.coefficients.WS2M, futureX)),
      unit: 'M/S',
      alert: (r.coefficients.WS2M.slope ?? 0) > 0.001 ? 'WIND PATTERNS SHIFTING' : 'WIND NOMINAL',
      alertColor: (r.coefficients.WS2M.slope ?? 0) > 0.001 ? 'text-amber-400' : 'text-stone-400',
      lineColor: '#fbbf24',
      trend: ((r.coefficients.WS2M.slope ?? 0) > 0 ? 'up' : 'down') as 'up' | 'down',
      series: s.WS2M,
    },
    {
      label: 'SOLAR RADIATION',
      description: 'The amount of energy from the Sun reaching Earths surface. It affects heating, evaporation, plant growth, and solar power potential.',
      value: fmt(project(r.coefficients.ALLSKY_SFC_SW_DWN, futureX)),
      unit: 'KWH/M2/DAY',
      alert: (r.coefficients.ALLSKY_SFC_SW_DWN.slope ?? 0) > 0 ? 'IRRADIANCE RISING' : 'IRRADIANCE STABLE',
      alertColor: (r.coefficients.ALLSKY_SFC_SW_DWN.slope ?? 0) > 0 ? 'text-rose-400' : 'text-stone-400',
      lineColor: '#fb923c',
      trend: ((r.coefficients.ALLSKY_SFC_SW_DWN.slope ?? 0) > 0 ? 'up' : 'down') as 'up' | 'down',
      series: s.ALLSKY_SFC_SW_DWN,
    },
  ]
}

export function StatPanel() {
  const {
    earthRegression,
    earthSeries,
    earthLoading,
    elapsedYears,
    setEarthRegression,
    setEarthSeries,
    setEarthLoading,
    setTimeToBreach,
  } = useAppStore()

  useEffect(() => {
    const load = () => {
      setEarthLoading(true)
      fetch('/api/earth-data')
        .then((r) => r.json())
        .then((payload: { ok: boolean; regression: EarthRegression; series: EarthSeries }) => {
          if (payload.ok) {
            setEarthRegression(payload.regression)
            setEarthSeries(payload.series)
            const breach = computeFirstBreach(payload.regression, payload.series)
            setTimeToBreach(breach.years, breach.label)
          }
        })
        .catch(() => {})
        .finally(() => setEarthLoading(false))
    }

    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [setEarthRegression, setEarthSeries, setEarthLoading, setTimeToBreach])

  if (earthLoading) {
    return (
      <div className="flex h-full w-[340px] shrink-0 flex-col overflow-hidden border-l border-stone-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 border-b border-stone-800 bg-[#1a1a1a] px-5 py-4">
            <div className="flex h-full flex-col justify-center gap-3">
              <div className="h-2 w-24 animate-pulse rounded bg-stone-800" />
              <div className="h-8 w-20 animate-pulse rounded bg-stone-700" />
              <div className="h-10 w-full animate-pulse rounded bg-stone-800" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!earthRegression || !earthSeries) {
    return (
      <div className="flex h-full w-[340px] shrink-0 items-center justify-center overflow-hidden border-l border-stone-800">
        <span className="font-mono text-xs uppercase text-rose-400">NASA DATA UNAVAILABLE</span>
      </div>
    )
  }

  const stats = buildStats(earthRegression, earthSeries, elapsedYears)

  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col overflow-hidden border-l border-stone-800">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
