'use client'
 
import { useEffect, useMemo, useRef, useState } from 'react'
import { getMissionPhase, type LaunchState } from '@/components/launch/launchAnimation'
import type { Planet } from '@/store/useAppStore'
import { ArrivalScreen } from './ArrivalScreen'
 
const ORIGIN = { x: 64, y: 160 }
const MIN_VISIBLE_DISTANCE_LY = 4
const MAX_VISIBLE_DISTANCE_LY = 1500
const TARGET_MIN_X = 146
const TARGET_MAX_X = 286
const TARGET_MIN_Y = 72
const TARGET_MAX_Y = 248
 
export function OrbitalMap({
  planet,
  launchState,
  progress,
  onLaunch,
  onReplay,
  onSelectNew,
}: {
  planet: Planet | null
  launchState: LaunchState
  progress: number
  onLaunch: () => void
  onReplay: () => void
  onSelectNew: () => void
}) {
  const destinationName = planet?.name ?? 'NO TARGET'
  const hasSelection = Boolean(planet)
  const missionProgress = launchState === 'arrived' ? 1 : progress
  const distanceLy = planet?.distanceLy ?? null
  const missionPhase = getMissionPhase(launchState, progress)
  const progressPercent = launchState === 'arrived' ? 100 : Math.round(progress * 100)
  const distanceLabel = distanceLy ? `${distanceLy.toLocaleString()} LY` : '--'
  const hasArrived = launchState === 'arrived'
 
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0a0a0a]">
      <div className="shrink-0 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-rose-300">
          Orbital Dynamics Map
        </span>
        <span className="font-mono text-[10px] text-stone-500">SECTOR: 04-G</span>
      </div>
 
      <div className="relative flex flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.08),_transparent_56%)]">
        {/* Orrery always rendered underneath */}
        <div className="w-full h-full">
          <div className="flex h-full items-center justify-center px-4 py-4">
            <OrreryCanvas
              planet={planet}
              planetName={destinationName}
              launchState={launchState}
              progress={missionProgress}
              hasSelection={hasSelection}
            />
          </div>
        </div>
 
        {/* Arrival screen overlays the orrery when arrived */}
        {hasArrived && planet && (
          <ArrivalScreen
            planet={planet}
            onReplay={onReplay}
            onSelectNew={onSelectNew}
          />
        )}
 
        {/* Launch button — hidden once arrived */}
        {!hasArrived && (
          <div className="absolute bottom-6 right-6 flex w-[280px] flex-col gap-3">
            <button
              type="button"
              onClick={onLaunch}
              disabled={!planet || launchState === 'arming' || launchState === 'inFlight'}
              className={`w-full py-5 text-base font-black uppercase tracking-widest transition-all ${
                !planet
                  ? 'cursor-not-allowed bg-stone-800 text-stone-500'
                  : launchState === 'arming' || launchState === 'inFlight'
                    ? 'cursor-default bg-emerald-700 text-emerald-200'
                    : 'bg-emerald-500 text-green-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400'
              }`}
            >
              {!planet
                ? 'SELECT A DESTINATION'
                : launchState === 'arming'
                  ? 'ARMING...'
                  : launchState === 'inFlight'
                    ? `${progressPercent}% — IN FLIGHT`
                    : 'LAUNCH'}
            </button>
          </div>
        )}
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
    if (!path) return
    setPathLength(path.getTotalLength())
  }, [trajectoryPath])
 
  useEffect(() => {
    const path = pathRef.current
    if (!path) return
 
    const totalLength = path.getTotalLength()
    const currentPoint = path.getPointAtLength(totalLength * progress)
    const nextPoint = path.getPointAtLength(
      Math.min(totalLength, totalLength * Math.min(progress + 0.015, 1))
    )
 
    setShipPosition({ x: currentPoint.x, y: currentPoint.y })
    setShipAngle((Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * 180) / Math.PI)
  }, [progress, trajectoryPath])
 
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
      viewBox="0 0 260 260"
      className="h-[78vh] w-full max-w-[900px]"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(2 -4) scale(1.08)">
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={4.5} fill="#fcd34d" />
 
        <circle
          cx={ORIGIN.x}
          cy={ORIGIN.y}
          r={launchState === 'arming' ? 11 : 8.5}
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
          strokeWidth="0.7"
          opacity={earthPulseOpacity * 0.7}
        />
 
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
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={launchState === 'idle' ? pathLength : pathRevealOffset}
          opacity={hasSelection ? 0.92 : 0.18}
          style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.55))' }}
        />
 
        <circle cx={target.x} cy={target.y} r={3.5} fill="#10b981" />
        <circle
          cx={target.x}
          cy={target.y}
          r={launchState === 'arrived' ? 13 : 9}
          fill="none"
          stroke="#10b981"
          strokeWidth="1"
          opacity={destinationPulseOpacity}
        />
        <circle
          cx={target.x}
          cy={target.y}
          r={launchState === 'arrived' ? 19 : 13}
          fill="none"
          stroke="#6ee7b7"
          strokeWidth="0.8"
          opacity={destinationPulseOpacity * 0.65}
        />
 
        {displayShip && (
          <g transform={`translate(${shipPosition.x} ${shipPosition.y}) rotate(${shipAngle})`}>
            <circle r="6.2" fill="#0f172a" stroke="#e2e8f0" strokeWidth="0.9" />
            <path d="M -4.5 -1.2 L 6 0 L -4.5 1.2 Z" fill="#f8fafc" />
            <path d="M -1 -4.5 L 1 -4.5 L 0 -8.8 Z" fill="#10b981" opacity="0.9" />
          </g>
        )}
 
        <text
          x={160}
          y={28}
          fill={hasSelection ? '#86efac' : '#737373'}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          {statusLabel}
        </text>
 
        <text
          x={Math.min(target.x + 9, 290)}
          y={target.y - 11}
          fill="#10b981"
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="bold"
        >
          TARGET DESTINATION
        </text>
        <text
          x={Math.min(target.x + 9, 290)}
          y={target.y + 3}
          fill={hasSelection ? '#e7e5e4' : '#78716c'}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {planetName}
        </text>
 
        <text
          x={ORIGIN.x - 9}
          y={181}
          fill="#fda4af"
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="end"
        >
          ORIGIN VECTOR
        </text>
        <text
          x={ORIGIN.x - 9}
          y={192}
          fill="#e7e5e4"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="end"
        >
          SOL / EARTH
        </text>
      </g>
    </svg>
  )
}
 
function getTargetPoint(planet: Planet | null) {
  if (!planet) return { x: 232, y: 130 }
 
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
 
  return { x, y }
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