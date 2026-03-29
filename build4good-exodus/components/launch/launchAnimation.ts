'use client'

export type LaunchState = 'idle' | 'arming' | 'inFlight' | 'arrived'

export const ARMING_DURATION_MS = 1200
export const FLIGHT_DURATION_MS = 4600
export const TOTAL_LAUNCH_DURATION_MS = ARMING_DURATION_MS + FLIGHT_DURATION_MS

export function getMissionPhase(state: LaunchState, progress: number) {
  if (state === 'idle') {
    return 'trajectory lock'
  }

  if (state === 'arming') {
    return 'burn'
  }

  if (state === 'arrived') {
    return 'arrival'
  }

  return progress > 0.72 ? 'arrival' : 'cruise'
}
