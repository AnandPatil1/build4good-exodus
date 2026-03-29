'use client'

import { useEffect, useRef, useState } from 'react'
import type { Planet } from '@/store/useAppStore'

const FONT = 'var(--font-geist-mono), "Courier New", monospace'
const FLICKER_DURATION_MS = 2200
const FLICKER_INTERVAL_MS = 60
const REVEAL_DELAY_MS = 600

const ROCKET_LINES: { text: string; style: string; opacity?: number }[] = [
  { text: '        ^', style: 'bright' },
  { text: '      /    \\', style: 'bright' },
  { text: '     /___\\', style: 'bright' },
  { text: '    |=     =|', style: 'body' },
  { text: '    |          |', style: 'body' },
  { text: '    |          |', style: 'body' },
  { text: '    |          |', style: 'body' },
  { text: '    |          |', style: 'body' },
  { text: '    |          |', style: 'body' },
  { text: '   /|##!##|\\', style: 'body' },
  { text: '  / |##!##| \\', style: 'body' },
  { text: ' /  |##!##|  \\', style: 'body' },
  { text: '|  /  ^ | ^  \\  |', style: 'body' },
  { text: '|/     ( | )     \\|', style: 'body' },
  { text: '      ((   ))', style: 'flame' },
  { text: '     ((  :  ))', style: 'flame2' },
  { text: '     ((  :  ))', style: 'flame' },
  { text: '      ((   ))', style: 'flame2' },
  { text: '       (( ))', style: 'flame' },
  { text: '        ( )', style: 'flame2' },
  { text: '         .', style: 'trail' },
  { text: '         .', style: 'trail' },
  { text: '         .', style: 'trail' },
  { text: '         .', style: 'trail', opacity: 0.6 },
  { text: '         .', style: 'trail', opacity: 0.45 },
  { text: '         .', style: 'trail', opacity: 0.3 },
  { text: '         .', style: 'trail', opacity: 0.18 },
  { text: '         .', style: 'trail', opacity: 0.08 },
]

const LINE_COLORS: Record<string, string> = {
  bright: '#86efac',
  body: '#4ade80',
  flame: '#f97316',
  flame2: '#fbbf24',
  trail: '#166534',
}

const TERMINAL_TEXT = [
  '> ARRIVAL CONFIRMED.',
  '> Orbital insertion complete.',
  '> Surface scan initiated.',
  '> Candidate viable for habitation.',
  '>',
  '> REMEMBER EARTH.',
  '> Protect what made us.',
  '> ',
].join('\n')

const KEYFRAMES = `
@keyframes rocketRise {
  from { transform: translateY(80px); }
  to   { transform: translateY(-8px); }
}
@keyframes flame1 {
  0%   { opacity: 0.7; }
  100% { opacity: 1.0; }
}
@keyframes flame2 {
  0%   { opacity: 1.0; }
  100% { opacity: 0.7; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes lockIn {
  0% { letter-spacing: 0.1em; opacity: 0.6; }
  100% { letter-spacing: 0; opacity: 1; }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 900px) {
  .arrival-overlay {
    grid-template-columns: 1fr !important;
  }
  .arrival-hero {
    min-height: 46vh;
    border-right: none !important;
    border-bottom: 1px solid rgba(16,185,129,0.12);
  }
  .arrival-panel {
    border-left: none !important;
  }
}
.arrival-log {
  scrollbar-width: thin;
  scrollbar-color: #10b981 rgba(10,26,10,0.9);
}
.arrival-log::-webkit-scrollbar {
  width: 8px;
}
.arrival-log::-webkit-scrollbar-track {
  background: rgba(10,26,10,0.9);
}
.arrival-log::-webkit-scrollbar-thumb {
  background: rgba(16,185,129,0.8);
  border-radius: 999px;
  border: 1px solid rgba(3,10,3,0.85);
}
.arrival-log::-webkit-scrollbar-thumb:hover {
  background: rgba(110,231,183,0.9);
}
`

function getViabilityVerdict(score: number) {
  if (score >= 80) return 'PRIME CANDIDATE - AUTHORISED FOR COLONISATION'
  if (score >= 60) return 'VIABLE - FURTHER ASSESSMENT REQUIRED'
  if (score >= 40) return 'MARGINAL - HIGH-RISK HABITATION'
  return 'HOSTILE - NOT RECOMMENDED'
}

export function ArrivalScreen({
  planet,
  onReplay,
  onSelectNew,
}: {
  planet: Planet
  onReplay: () => void
  onSelectNew: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState('')
  const [displayedCvi, setDisplayedCvi] = useState('--')
  const [isCviLocked, setIsCviLocked] = useState(false)
  const [showVerdict, setShowVerdict] = useState(false)
  const [barFill, setBarFill] = useState(0)
  const [isReplayHovered, setIsReplayHovered] = useState(false)
  const [isSelectHovered, setIsSelectHovered] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cviIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const missionLogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const missionLog = missionLogRef.current
    if (!missionLog) return

    missionLog.scrollTop = missionLog.scrollHeight
  }, [displayed])

  useEffect(() => {
    setDisplayed('')
    setDisplayedCvi('--')
    setIsCviLocked(false)
    setShowVerdict(false)
    setBarFill(0)

    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []

    let index = 0
    intervalRef.current = setInterval(() => {
      index += 1
      setDisplayed(TERMINAL_TEXT.slice(0, index))

      if (index >= TERMINAL_TEXT.length && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }, 18)

    const revealDelay = setTimeout(() => {
      let elapsed = 0

      cviIntervalRef.current = setInterval(() => {
        elapsed += FLICKER_INTERVAL_MS

        if (elapsed < FLICKER_DURATION_MS) {
          setDisplayedCvi(String(Math.floor(Math.random() * 100)).padStart(2, '0'))
          return
        }

        if (cviIntervalRef.current) {
          clearInterval(cviIntervalRef.current)
        }

        setDisplayedCvi(String(planet.cvi).padStart(2, '0'))
        setIsCviLocked(true)

        const barDelay = setTimeout(() => setBarFill(planet.cvi), 100)
        const verdictDelay = setTimeout(() => setShowVerdict(true), 600)
        timeoutRefs.current.push(barDelay, verdictDelay)
      }, FLICKER_INTERVAL_MS)
    }, REVEAL_DELAY_MS)

    timeoutRefs.current.push(revealDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (cviIntervalRef.current) clearInterval(cviIntervalRef.current)
      timeoutRefs.current.forEach(clearTimeout)
      timeoutRefs.current = []
    }
  }, [planet.id, planet.cvi])

  const termLines = displayed.split('\n')
  const stats = [
    { label: 'TEMPERATURE', value: planet.temp.toLocaleString(), unit: 'K' },
    { label: 'RADIUS', value: planet.radius.toFixed(2), unit: 'R_E' },
    { label: 'DISTANCE', value: planet.distanceLy.toLocaleString(), unit: 'LY' },
    { label: 'PERIOD', value: planet.period ? planet.period.toLocaleString() : '--', unit: planet.period ? 'd' : '' },
  ]

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        className="arrival-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: '#030a03',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease',
          fontFamily: FONT,
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(0deg, transparent, transparent, rgba(16,185,129,0.018) 2px, transparent 4px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {[
          { top: 10, left: 10, borderWidth: '1px 0 0 1px' },
          { top: 10, right: 10, borderWidth: '1px 1px 0 0' },
          { bottom: 10, left: 10, borderWidth: '0 0 1px 1px' },
          { bottom: 10, right: 10, borderWidth: '0 1px 1px 0' },
        ].map((style, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: 14,
              height: 14,
              borderColor: 'rgba(16,185,129,0.35)',
              borderStyle: 'solid',
              zIndex: 2,
              ...style,
            }}
          />
        ))}

        <div
          className="arrival-hero"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            borderRight: '1px solid rgba(16,185,129,0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 9,
              letterSpacing: '0.35em',
              color: '#166534',
            }}
          >
            {'// ARRIVAL CONFIRMED - ORBIT ACHIEVED'}
          </div>

          <div
            style={{
              animation: visible ? 'rocketRise 7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none',
            }}
          >
            <pre
              style={{
                fontFamily: FONT,
                fontSize: 13,
                lineHeight: 1.35,
                margin: 0,
                userSelect: 'none',
              }}
            >
              {ROCKET_LINES.map((line, index) => {
                const isFlame = line.style === 'flame'
                const isFlame2 = line.style === 'flame2'

                return (
                  <span
                    key={index}
                    style={{
                      display: 'block',
                      color: LINE_COLORS[line.style],
                      opacity: line.opacity ?? 1,
                      animation: isFlame
                        ? 'flame1 0.6s ease-in-out infinite alternate'
                        : isFlame2
                          ? 'flame2 0.4s ease-in-out infinite alternate-reverse'
                          : undefined,
                    }}
                  >
                    {line.text}
                  </span>
                )
              })}
            </pre>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 0,
              right: 0,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, letterSpacing: '0.2em', color: '#4ade80', fontWeight: 'bold' }}>
              {planet.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#166534', marginTop: 4 }}>
              {planet.distanceLy.toLocaleString()} LY FROM SOL
            </div>
          </div>
        </div>

        <div
          className="arrival-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: '1px solid rgba(16,185,129,0.12)',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(16,185,129,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 1.4s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 9, letterSpacing: '0.25em', color: '#10b981' }}>DESTINATION LOCKED</span>
          </div>

          <div
            style={{
              position: 'relative',
              padding: '16px 16px 12px',
              borderBottom: '1px solid rgba(16,185,129,0.12)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'repeating-linear-gradient(0deg, transparent, transparent, rgba(16,185,129,0.018) 2px, transparent 4px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 8, letterSpacing: '0.4em', color: '#166534', marginBottom: 12 }}>
                {'// COLONIAL VIABILITY INDEX'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div
                  style={{
                    fontSize: 72,
                    lineHeight: 0.9,
                    minWidth: 100,
                    fontWeight: 700,
                    color: isCviLocked ? '#4ade80' : '#86efac',
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: isCviLocked ? 'none' : '0 0 18px rgba(134,239,172,0.6)',
                    letterSpacing: isCviLocked ? '0' : '0.04em',
                    animation: isCviLocked ? 'lockIn 0.4s ease forwards' : undefined,
                    transition: 'color 0.1s ease, text-shadow 0.1s ease',
                  }}
                >
                  {displayedCvi}
                </div>
                <div style={{ fontSize: 16, color: '#166534' }}>/100</div>
              </div>
              <div style={{ height: 4, background: '#0a1a0a', marginTop: 10 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${barFill}%`,
                    background: '#10b981',
                    transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                />
              </div>
              <div
                style={{
                  minHeight: 16,
                  marginTop: 8,
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  color: showVerdict ? '#86efac' : '#166534',
                  opacity: showVerdict ? 1 : 0,
                  animation: showVerdict ? 'fadeUp 0.4s ease forwards' : undefined,
                }}
              >
                {showVerdict ? getViabilityVerdict(planet.cvi) : ''}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              background: 'rgba(16,185,129,0.08)',
              borderBottom: '1px solid rgba(16,185,129,0.12)',
            }}
            >
            {stats.map((stat) => (
              <div key={stat.label} style={{ background: '#030a03', padding: '12px 14px 10px' }}>
                <div style={{ fontSize: 8, letterSpacing: '0.25em', color: '#166534', marginBottom: 5 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 15, color: '#4ade80', fontWeight: 'bold' }}>
                  {stat.value}
                  {stat.unit ? (
                    <span style={{ fontSize: 8, color: '#166534', marginLeft: 2 }}>{stat.unit}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div
            className="arrival-log"
            style={{
              flex: 1,
              padding: '14px 16px',
              overflowY: 'auto',
              overflowX: 'hidden',
              borderBottom: '1px solid rgba(16,185,129,0.12)',
            }}
            ref={missionLogRef}
          >
            <div
              style={{
                fontSize: 8,
                letterSpacing: '0.3em',
                color: '#166534',
                borderBottom: '1px solid rgba(16,185,129,0.1)',
                paddingBottom: 8,
                marginBottom: 10,
              }}
            >
              {'// MISSION LOG'}
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.95, color: '#22c55e' }}>
              {termLines.map((line, index) => {
                const isLast = index === termLines.length - 1
                const isBright = line.includes('ARRIVAL CONFIRMED') || line.includes('viable')
                const isWarn = line.includes('REMEMBER EARTH')
                const color = isWarn ? '#fbbf24' : isBright ? '#86efac' : '#22c55e'

                return (
                  <div key={index} style={{ color }}>
                    {line}
                    {isLast && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 6,
                          height: 10,
                          background: '#10b981',
                          verticalAlign: 'middle',
                          marginLeft: 2,
                          animation: 'blink 0.7s step-end infinite',
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={onReplay}
              onMouseEnter={() => setIsReplayHovered(true)}
              onMouseLeave={() => setIsReplayHovered(false)}
              style={{
                width: '100%',
                padding: 10,
                background: isReplayHovered ? 'rgba(16,185,129,0.12)' : 'transparent',
                border: '1px solid rgba(16,185,129,0.45)',
                color: isReplayHovered ? '#6ee7b7' : '#10b981',
                fontFamily: FONT,
                fontSize: 9,
                letterSpacing: '0.3em',
                cursor: 'pointer',
                transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
              }}
            >
              REPLAY MISSION
            </button>
            <button
              onClick={onSelectNew}
              onMouseEnter={() => setIsSelectHovered(true)}
              onMouseLeave={() => setIsSelectHovered(false)}
              style={{
                width: '100%',
                padding: 10,
                background: isSelectHovered ? 'rgba(16,185,129,0.12)' : 'transparent',
                border: '1px solid rgba(16,185,129,0.45)',
                color: isSelectHovered ? '#6ee7b7' : '#10b981',
                fontFamily: FONT,
                fontSize: 9,
                letterSpacing: '0.3em',
                cursor: 'pointer',
                transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
              }}
            >
              SELECT NEW TARGET
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
