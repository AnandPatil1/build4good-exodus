'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

interface InfoTooltipProps {
  term: string
  description: string
  children: ReactNode
  className?: string
  textClassName?: string
}

type TooltipPosition = {
  left: number
  top: number
  width: number
}

const TOOLTIP_WIDTH = 260
const VIEWPORT_MARGIN = 12
const TOOLTIP_OFFSET = 12

export function InfoTooltip({
  term,
  description,
  children,
  className = '',
  textClassName = '',
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<TooltipPosition>({
    left: VIEWPORT_MARGIN,
    top: VIEWPORT_MARGIN,
    width: TOOLTIP_WIDTH,
  })
  const tooltipId = useId()
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const tooltipRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || typeof window === 'undefined') {
      return
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return
      }

      const rect = triggerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipWidth = Math.min(TOOLTIP_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2)
      const tooltipHeight = tooltipRef.current?.offsetHeight ?? 120

      const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - tooltipWidth - VIEWPORT_MARGIN)
      const centeredLeft = rect.left + rect.width / 2 - tooltipWidth / 2
      const clampedLeft = Math.min(Math.max(VIEWPORT_MARGIN, centeredLeft), maxLeft)

      const preferredTop = rect.bottom + TOOLTIP_OFFSET
      const fitsBelow = preferredTop + tooltipHeight <= viewportHeight - VIEWPORT_MARGIN
      const fallbackTop = Math.max(VIEWPORT_MARGIN, rect.top - tooltipHeight - TOOLTIP_OFFSET)
      const clampedTop = fitsBelow
        ? preferredTop
        : Math.min(fallbackTop, viewportHeight - tooltipHeight - VIEWPORT_MARGIN)

      setPosition({
        left: clampedLeft,
        top: Math.max(VIEWPORT_MARGIN, clampedTop),
        width: tooltipWidth,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  const tooltip = mounted && open
    ? createPortal(
        <span
          id={tooltipId}
          ref={tooltipRef}
          role="tooltip"
          className="pointer-events-none fixed z-[120] rounded-xl border border-stone-700/90 bg-[#141414]/96 px-4 py-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md"
          style={{ left: position.left, top: position.top, width: position.width }}
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-200/90">
            {term}
          </span>
          <span className="mt-1.5 block text-[12px] font-medium leading-5 tracking-normal text-stone-200">
            {description}
          </span>
        </span>,
        document.body,
      )
    : null

  return (
    <>
      <span
        className={`inline-flex items-center ${className}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span
          className="term-glitch-trigger inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70"
          ref={triggerRef}
          role="button"
          tabIndex={0}
          aria-label={`Explain ${term}`}
          aria-describedby={open ? tooltipId : undefined}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          <span
            className={`term-glitch cursor-help underline decoration-dotted underline-offset-4 focus:outline-none ${textClassName}`}
          >
            {children}
          </span>
        </span>
      </span>
      {tooltip}
    </>
  )
}
