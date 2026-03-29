'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { LaunchState } from '@/components/launch/launchAnimation'
import type { Planet } from '@/store/useAppStore'

const ORIGIN = { x: 64, y: 160 }
const MIN_VISIBLE_DISTANCE_LY = 4
const MAX_VISIBLE_DISTANCE_LY = 1500
const TRIP_DURATION_YEARS = 6
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60
const KM_PER_LIGHT_YEAR = 9.4607e12
const TARGET_MIN_X = 146
const TARGET_MAX_X = 286
const TARGET_MIN_Y = 72
const TARGET_MAX_Y = 248

export function OrbitalMap({
  planet,
  launchState,
  progress,
}: {
  planet: Planet | null
  launchState: LaunchState
  progress: number
}) {
  const destinationName = planet?.name ?? 'NO TARGET'
  const hasSelection = Boolean(planet)
  const missionProgress = launchState === 'arrived' ? 1 : progress
  const distanceLy = planet?.distanceLy ?? null
  const averageSpeedKmPerSec = distanceLy
    ? distanceLy * KM_PER_LIGHT_YEAR / (TRIP_DURATION_YEARS * SECONDS_PER_YEAR)
    : null

  const velocity =
    launchState === 'idle'
      ? 'STANDBY'
      : launchState === 'arming'
        ? 'BURN READY'
        : launchState === 'arrived'
          ? 'ARRIVED'
          : averageSpeedKmPerSec
            ? `${Math.round(averageSpeedKmPerSec).toLocaleString()} KM/S`
            : '--'

  const remainingYears = distanceLy ? Math.max(0, TRIP_DURATION_YEARS * (1 - missionProgress)) : null
  const eta =
    launchState === 'idle'
      ? '--'
      : launchState === 'arrived'
        ? 'LOCKED'
        : remainingYears !== null
          ? formatYearsToEta(remainingYears)
          : '--'

  const distanceLabel = distanceLy ? `${distanceLy.toLocaleString()} LY` : '--'

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-800 flex justify-between items-center shrink-0">
        <span className="text-rose-300 text-xs font-black uppercase tracking-wider">Orbital Dynamics Map</span>
        <span className="text-stone-500 text-[10px] font-mono">SECTOR: 04-G</span>
      </div>

      {/* Orrery */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-8 py-6 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.08),_transparent_56%)]">
        <OrreryCanvas
          planet={planet}
          planetName={destinationName}
          launchState={launchState}
          progress={missionProgress}
          hasSelection={hasSelection}
        />
      </div>

      {/* Footer stats */}
      <div className="px-6 py-4 border-t border-stone-800 bg-stone-900 shrink-0 grid grid-cols-3 gap-4">
        <div>
          <div className="text-stone-500 text-[9px] font-bold uppercase tracking-wide">Distance</div>
          <div className="text-stone-200 text-base font-mono mt-1">{distanceLabel}</div>
        </div>
        <div>
          <div className="text-stone-500 text-[9px] font-bold uppercase tracking-wide">Average Velocity</div>
          <div className="text-stone-200 text-base font-mono mt-1">{velocity}</div>
        </div>
        <div>
          <div className="text-stone-500 text-[9px] font-bold uppercase tracking-wide">Arrival ETA</div>
          <div className="text-stone-200 text-base font-mono mt-1">{eta}</div>
        </div>
      </div>
    </div>
  )
}

function OrreryCanvas({
  planet,
  planetName,
  launchState,
  progress,
  hasSelection,
}: {
  planet: Planet | null
  planetName: string
  launchState: LaunchState
  progress: number
  hasSelection: boolean
}) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const [pathLength, setPathLength] = useState(1)
  const [shipPosition, setShipPosition] = useState(ORIGIN)
  const [shipAngle, setShipAngle] = useState(-20)
  const target = useMemo(() => getTargetPoint(planet), [planet])
  const control = useMemo(() => getControlPoint(target), [target])
  const trajectoryPath = useMemo(
    () => `M ${ORIGIN.x} ${ORIGIN.y} Q ${control.x} ${control.y} ${target.x} ${target.y}`,
    [control, target]
  )

  useEffect(() => {
    const path = pathRef.current

    if (!path) {
      return
    }

    setPathLength(path.getTotalLength())
  }, [])

  useEffect(() => {
    const path = pathRef.current

    if (!path) {
      return
    }

    const totalLength = path.getTotalLength()
    const currentPoint = path.getPointAtLength(totalLength * progress)
    const nextPoint = path.getPointAtLength(Math.min(totalLength, totalLength * Math.min(progress + 0.015, 1)))

    setShipPosition({ x: currentPoint.x, y: currentPoint.y })
    setShipAngle((Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * 180) / Math.PI)
  }, [progress])

  const destinationPulseOpacity = launchState === 'arrived' ? 1 : 0.18
  const earthPulseOpacity = launchState === 'idle' ? 0.25 : 0.85
  const displayShip = launchState !== 'idle'
  const pathRevealOffset = pathLength * (1 - progress)
  const statusLabel =
    !hasSelection
      ? 'AWAITING DESTINATION'
      : launchState === 'idle'
        ? 'TRAJECTORY IDLE'
        : launchState === 'arming'
          ? 'BURN SEQUENCE'
          : launchState === 'arrived'
            ? 'DESTINATION LOCKED'
            : 'TRANSFER IN PROGRESS'

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 320 320"
      className="max-h-[620px] max-w-[820px]"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r={4} fill="#fcd34d" />
      <circle
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        r={launchState === 'arming' ? 10 : 8}
        fill="none"
        stroke="#fb7185"
        strokeWidth="1"
        opacity={earthPulseOpacity}
      />
      <circle
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        r={launchState === 'arming' ? 16 : 13}
        fill="none"
        stroke="#fb7185"
        strokeWidth="0.6"
        opacity={earthPulseOpacity * 0.7}
      />

      {/* Launch trajectory arc */}
      <path
        d={trajectoryPath}
        fill="none"
        stroke="#14532d"
        strokeWidth="1"
        strokeDasharray="3 5"
        opacity="0.55"
      />
      <path
        ref={pathRef}
        d={trajectoryPath}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={launchState === 'idle' ? pathLength : pathRevealOffset}
        opacity={hasSelection ? 0.92 : 0.18}
        style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.55))' }}
      />

      {/* Target destination dot */}
      <circle
        cx={target.x}
        cy={target.y}
        r={3}
        fill="#10b981"
      />
      <circle
        cx={target.x}
        cy={target.y}
        r={launchState === 'arrived' ? 12 : 8}
        fill="none"
        stroke="#10b981"
        strokeWidth="1"
        opacity={destinationPulseOpacity}
      />
      <circle
        cx={target.x}
        cy={target.y}
        r={launchState === 'arrived' ? 18 : 12}
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="0.7"
        opacity={destinationPulseOpacity * 0.65}
      />

      {displayShip && (
        <g transform={`translate(${shipPosition.x} ${shipPosition.y}) rotate(${shipAngle})`}>
          <circle r="5.5" fill="#0f172a" stroke="#e2e8f0" strokeWidth="0.8" />
          <path d="M -4 -1 L 5 0 L -4 1 Z" fill="#f8fafc" />
          <path d="M -1 -4 L 1 -4 L 0 -8 Z" fill="#10b981" opacity="0.9" />
        </g>
      )}

      <text
        x={160}
        y={28}
        fill={hasSelection ? '#86efac' : '#737373'}
        fontSize="9"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="middle"
      >
        {statusLabel}
      </text>

      {/* Target label */}
      <text
        x={Math.min(target.x + 8, 290)}
        y={target.y - 10}
        fill="#10b981"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="bold"
      >
        TARGET DESTINATION
      </text>
      <text
        x={Math.min(target.x + 8, 290)}
        y={target.y + 2}
        fill={hasSelection ? '#e7e5e4' : '#78716c'}
        fontSize="9"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {planetName}
      </text>

      {/* Origin label */}
      <text
        x={ORIGIN.x - 8}
        y={180}
        fill="#fda4af"
        fontSize="8"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="end"
      >
        ORIGIN VECTOR
      </text>
      <text
        x={ORIGIN.x - 8}
        y={190}
        fill="#e7e5e4"
        fontSize="9"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="end"
      >
        SOL / EARTH
      </text>
    </svg>
  )
}

function getTargetPoint(planet: Planet | null) {
  if (!planet) {
    return { x: 232, y: 130 }
  }

  const clampedDistance = Math.min(
    Math.max(planet.distanceLy, MIN_VISIBLE_DISTANCE_LY),
    MAX_VISIBLE_DISTANCE_LY
  )
  const normalizedDistance =
    (clampedDistance - MIN_VISIBLE_DISTANCE_LY) /
    (MAX_VISIBLE_DISTANCE_LY - MIN_VISIBLE_DISTANCE_LY)
  const x = TARGET_MIN_X + normalizedDistance * (TARGET_MAX_X - TARGET_MIN_X)
  const normalizedDeclination = (planet.dec + 90) / 180
  const y = TARGET_MAX_Y - normalizedDeclination * (TARGET_MAX_Y - TARGET_MIN_Y)

  return {
    x,
    y,
  }
}

function getControlPoint(target: { x: number; y: number }) {
  const horizontalMidpoint = ORIGIN.x + (target.x - ORIGIN.x) * 0.52
  const arcLift = Math.max(34, 92 - (target.x - ORIGIN.x) * 0.2)
  const baseY = Math.min(ORIGIN.y, target.y)

  return {
    x: horizontalMidpoint,
    y: Math.max(22, baseY - arcLift),
  }
}

function formatYearsToEta(years: number) {
  const wholeYears = Math.floor(years)
  const remainingMonths = Math.round((years - wholeYears) * 12)

  if (wholeYears <= 0) {
    return `${Math.max(1, remainingMonths)} MO`
  }

  if (remainingMonths === 12) {
    return `${wholeYears + 1} YR`
  }

  if (remainingMonths === 0) {
    return `${wholeYears} YR`
  }

  return `${wholeYears}Y ${remainingMonths}M`
}
