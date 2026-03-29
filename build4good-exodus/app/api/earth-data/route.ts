import { getEarthData } from '@/lib/nasaPower'
import { getEarthDataRegressionCoefficients } from '@/lib/get-earth-data-regression'
import { NextResponse } from 'next/server'

const LAT = 39.5
const LON = -98.35

const PARAMS = ['T2M', 'PRECTOTCORR', 'RH2M', 'WS2M', 'ALLSKY_SFC_SW_DWN'] as const

type NasaPowerPayload = {
  properties?: {
    parameter?: Record<string, Record<string, number | null>>
  }
}

export async function GET() {
  try {
    const earthData = await getEarthData(LAT, LON)
    const regression = getEarthDataRegressionCoefficients(earthData)

    const raw = earthData.data as NasaPowerPayload
    const paramData = raw.properties?.parameter ?? {}

    const series: Record<string, number[]> = {}
    for (const param of PARAMS) {
      series[param] = Object.entries(paramData[param] ?? {})
        .filter(([k, v]) => /^\d{6}$/.test(k) && k.slice(4, 6) !== '13' && v != null && (v as number) > -900)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => v as number)
    }

    return NextResponse.json({ ok: true, regression, series })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const stack = err instanceof Error ? err.stack : ''
    console.error('Earth API error:', message, stack)
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 })
  }
}