'use client'

import { useEffect, useRef, useState } from 'react'
import type { Planet } from '@/store/useAppStore'

const FONT = 'var(--font-geist-mono), "Courier New", monospace'

const ROCKET_LINES: { text: string; style: string; opacity?: number }[] = [
  { text: '       ^',          style: 'bright' },
  { text: '      / \\',        style: 'bright' },
  { text: '     /___\\',       style: 'bright' },
  { text: '    |=   =|',       style: 'body' },
  { text: '    |     |',       style: 'body' },
  { text: '    |     |',       style: 'body' },
  { text: '    |     |',       style: 'body' },
  { text: '    |     |',       style: 'body' },
  { text: '    |     |',       style: 'body' },
  { text: '   /|##!##|\\',     style: 'body' },
  { text: '  / |##!##| \\',    style: 'body' },
  { text: ' /  |##!##|  \\',   style: 'body' },
  { text: '|  / ^ | ^ \\  |',  style: 'body' },
  { text: '|/   ( | )   \\|',  style: 'body' },
  { text: '    ((   ))',        style: 'flame' },
  { text: '   ((  :  ))',      style: 'flame2' },
  { text: '   ((  :  ))',      style: 'flame' },
  { text: '    ((   ))',       style: 'flame2' },
  { text: '     (( ))',        style: 'flame' },
  { text: '      ( )',         style: 'flame2' },
  { text: '       .',          style: 'trail' },
  { text: '       .',          style: 'trail' },
  { text: '       .',          style: 'trail' },
  { text: '       ·',          style: 'trail', opacity: 0.6 },
  { text: '       ·',          style: 'trail', opacity: 0.45 },
  { text: '       ·',          style: 'trail', opacity: 0.3 },
  { text: '       ·',          style: 'trail', opacity: 0.18 },
  { text: '       ·',          style: 'trail', opacity: 0.08 },
]

const LINE_COLORS: Record<string, string> = {
  bright: '#86efac',
  body:   '#4ade80',
  flame:  '#f97316',
  flame2: '#fbbf24',
  trail:  '#166534',
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
  to   { transform: translateY(-40px); }
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
  50%       { opacity: 0.25; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  // Typewriter
  useEffect(() => {
    setDisplayed('')
    let i = 0
    intervalRef.current = setInterval(() => {
      i += 1
      setDisplayed(TERMINAL_TEXT.slice(0, i))
      if (i >= TERMINAL_TEXT.length && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }, 18)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [planet.id])

  const termLines = displayed.split('\n')

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#030a03',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        fontFamily: FONT,
        overflow: 'hidden',
        zIndex: 20,
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent, rgba(16,185,129,0.018) 2px, transparent 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Corner brackets */}
        {[
          { top: 10, left: 10,  borderWidth: '1px 0 0 1px' },
          { top: 10, right: 10, borderWidth: '1px 1px 0 0' },
          { bottom: 10, left: 10,  borderWidth: '0 0 1px 1px' },
          { bottom: 10, right: 10, borderWidth: '0 1px 1px 0' },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute', width: 14, height: 14,
            borderColor: 'rgba(16,185,129,0.35)', borderStyle: 'solid',
            zIndex: 2, ...s,
          }} />
        ))}

        {/* LEFT — ASCII hero */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          borderRight: '1px solid rgba(16,185,129,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 20, left: 0, right: 0,
            textAlign: 'center', fontSize: 9,
            letterSpacing: '0.35em', color: '#166534',
          }}>
            // ARRIVAL CONFIRMED — ORBIT ACHIEVED
          </div>

          {/* Rocket — rises once on mount */}
          <div style={{
            animation: visible
              ? 'rocketRise 7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
              : 'none',
          }}>
            <pre style={{
              fontFamily: FONT,
              fontSize: 13,
              lineHeight: 1.35,
              margin: 0,
              userSelect: 'none',
            }}>
              {ROCKET_LINES.map((line, i) => {
                const isFlame  = line.style === 'flame'
                const isFlame2 = line.style === 'flame2'
                return (
                  <span
                    key={i}
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

          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, letterSpacing: '0.2em', color: '#4ade80', fontWeight: 'bold' }}>
              {planet.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#166534', marginTop: 4 }}>
              {planet.distanceLy.toLocaleString()} LY FROM SOL
            </div>
          </div>
        </div>

        {/* RIGHT — panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderLeft: '1px solid rgba(16,185,129,0.12)',
        }}>

          {/* Status header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(16,185,129,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 1.4s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 9, letterSpacing: '0.25em', color: '#10b981' }}>
              DESTINATION LOCKED
            </span>
          </div>

          {/* 2×2 stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'rgba(16,185,129,0.08)',
            borderBottom: '1px solid rgba(16,185,129,0.12)',
          }}>
            {[
              {
                label: 'VIABILITY',
                value: planet.cvi,
                unit: '/100',
                bar: planet.cvi,
              },
              { label: 'TEMPERATURE', value: planet.temp, unit: 'K' },
              { label: 'RADIUS', value: planet.radius.toFixed(2), unit: 'R⊕' },
              { label: 'DISTANCE', value: planet.distanceLy.toLocaleString(), unit: 'LY' },
            ].map((s) => (
              <div key={s.label} style={{ background: '#030a03', padding: '12px 14px' }}>
                <div style={{ fontSize: 8, letterSpacing: '0.25em', color: '#166534', marginBottom: 5 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 15, color: '#4ade80', fontWeight: 'bold' }}>
                  {s.value}
                  <span style={{ fontSize: 8, color: '#166534', marginLeft: 2 }}>{s.unit}</span>
                </div>
                {'bar' in s && (
                  <div style={{ height: 2, background: '#0a1a0a', marginTop: 6 }}>
                    <div style={{ height: '100%', background: '#10b981', width: `${s.bar}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Terminal */}
          <div style={{
            flex: 1,
            padding: '14px 16px',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(16,185,129,0.12)',
          }}>
            <div style={{
              fontSize: 8,
              letterSpacing: '0.3em',
              color: '#166534',
              borderBottom: '1px solid rgba(16,185,129,0.1)',
              paddingBottom: 8,
              marginBottom: 10,
            }}>
              // MISSION LOG
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.85, color: '#22c55e' }}>
              {termLines.map((line, i) => {
                const isLast = i === termLines.length - 1
                const isBright = line.includes('ARRIVAL CONFIRMED') || line.includes('viable')
                const isWarn   = line.includes('REMEMBER EARTH')
                const color = isWarn ? '#fbbf24' : isBright ? '#86efac' : '#22c55e'
                return (
                  <div key={i} style={{ color }}>
                    {line}
                    {isLast && (
                      <span style={{
                        display: 'inline-block',
                        width: 6, height: 10,
                        background: '#10b981',
                        verticalAlign: 'middle',
                        marginLeft: 2,
                        animation: 'blink 0.7s step-end infinite',
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={onReplay}
              style={{
                width: '100%', padding: 10,
                background: 'transparent',
                border: '1px solid rgba(16,185,129,0.45)',
                color: '#10b981',
                fontFamily: FONT,
                fontSize: 9,
                letterSpacing: '0.3em',
                cursor: 'pointer',
              }}
            >
              REPLAY MISSION
            </button>
            <button
              onClick={onSelectNew}
              style={{
                width: '100%', padding: 10,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#374837',
                fontFamily: FONT,
                fontSize: 9,
                letterSpacing: '0.3em',
                cursor: 'pointer',
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