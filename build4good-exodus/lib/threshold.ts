import type { EarthRegression } from '@/store/useAppStore'

const PARAM_LABELS: Record<string, string> = {
  T2M: 'THERMAL RUNAWAY',
  PRECTOTCORR: 'HYDROLOGICAL COLLAPSE',
  RH2M: 'ATMOSPHERIC FAILURE',
  WS2M: 'PERMANENT STORM STATE',
  ALLSKY_SFC_SW_DWN: 'SOLAR IRRADIANCE CRISIS',
}

// Delta from baseline that counts as "critical" — always in the direction of the slope
function getCriticalDelta(param: string): number {
  const deltas: Record<string, number> = {
    T2M: 1.5,          // real tipping point (Paris Agreement)
    PRECTOTCORR: 0.25, // 25% precipitation shift = drought/flood instability
    RH2M: 6,           // humidity shift → human survivability issues
    WS2M: 0.7,         // stronger winds → storm escalation
    ALLSKY_SFC_SW_DWN: 2.5, // radiation imbalance
  }
  return deltas[param] ?? 1
}

export function computeFirstBreach(
  regression: EarthRegression,
  series: Record<string, number[]>
): { years: number; param: string; label: string } {
  const params = Object.keys(PARAM_LABELS)

  const results = params.map(param => {
    const data = series[param] ?? []
    const baseline = data.length > 0 ? data[data.length - 1] : 0
    const coeff = regression.coefficients[param as keyof typeof regression.coefficients]
    const slope = coeff.slope ?? 0

    // If slope is essentially flat, this param won't breach for centuries
    if (Math.abs(slope) < 0.000001) {
      return { param, label: PARAM_LABELS[param], years: 9999 }
    }

    // Threshold is always in the direction of slope so it's always reachable
    const delta = getCriticalDelta(param)
    const threshold = slope > 0 ? baseline + delta : baseline - delta

    // months = (threshold - baseline) / slope — always positive since delta matches slope direction
    const months = (threshold - baseline) / slope

    return {
      param,
      label: PARAM_LABELS[param],
      years: Math.max(1, months / 12), // minimum 1 year so timer doesn't start at 0
    }
  })

  results.sort((a, b) => a.years - b.years)
  return results[0]
}