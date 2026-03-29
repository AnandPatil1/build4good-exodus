'use client'

import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { create } from 'zustand'
import * as THREE from 'three'

type LaunchState = {
  isLaunching: boolean
  triggerLaunch: () => void
  completeLaunch: () => void
}

type LaunchParticle = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
  size: number
  color: string
}

const MAX_TRACER_POINTS = 600
const MAX_PARTICLES = 620
const IGNITION_DURATION = 0.5
const LAUNCH_DURATION = 5.5
const TOTAL_DURATION = 6.5
const EARTH_RADIUS = 1.38
const LAUNCH_X = 0.62
const LAUNCH_Y = EARTH_RADIUS + 0.14
const LAUNCH_Z = 0.94
const ROCKET_SCALE = 0.95

const useLaunchStore = create<LaunchState>((set, get) => ({
  isLaunching: false,
  triggerLaunch: () => {
    if (get().isLaunching) {
      return
    }

    set({ isLaunching: true })
  },
  completeLaunch: () => set({ isLaunching: false }),
}))

export function useLaunch() {
  const isLaunching = useLaunchStore((state) => state.isLaunching)
  const triggerLaunch = useLaunchStore((state) => state.triggerLaunch)

  return { isLaunching, triggerLaunch }
}

function RocketMesh({
  onGroupRef,
  onBodyMaterialRef,
  onNoseMaterialRef,
  onLeftFinMaterialRef,
  onRightFinMaterialRef,
  onLightRef,
}: {
  onGroupRef: (node: THREE.Group | null) => void
  onBodyMaterialRef: (node: THREE.MeshStandardMaterial | null) => void
  onNoseMaterialRef: (node: THREE.MeshStandardMaterial | null) => void
  onLeftFinMaterialRef: (node: THREE.MeshStandardMaterial | null) => void
  onRightFinMaterialRef: (node: THREE.MeshStandardMaterial | null) => void
  onLightRef: (node: THREE.PointLight | null) => void
}) {
  return (
    <group
      ref={onGroupRef}
      position={[LAUNCH_X, LAUNCH_Y, LAUNCH_Z]}
      scale={[ROCKET_SCALE, ROCKET_SCALE, ROCKET_SCALE]}
      visible={false}
    >
      <mesh>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 24]} />
        <meshStandardMaterial
          ref={onBodyMaterialRef}
          color="#CCCCCC"
          transparent
          opacity={1}
          roughness={0.45}
          metalness={0.35}
          emissive="#1f1f1f"
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh position={[0, 0.225, 0]}>
        <coneGeometry args={[0.04, 0.15, 24]} />
        <meshStandardMaterial
          ref={onNoseMaterialRef}
          color="#CCCCCC"
          transparent
          opacity={1}
          roughness={0.4}
          metalness={0.3}
          emissive="#341111"
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[-0.055, -0.11, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(15)]}>
        <boxGeometry args={[0.02, 0.1, 0.08]} />
        <meshStandardMaterial
          ref={onLeftFinMaterialRef}
          color="#CCCCCC"
          transparent
          opacity={1}
          roughness={0.55}
          metalness={0.18}
          emissive="#2a2a2a"
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh position={[0.055, -0.11, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(-15)]}>
        <boxGeometry args={[0.02, 0.1, 0.08]} />
        <meshStandardMaterial
          ref={onRightFinMaterialRef}
          color="#CCCCCC"
          transparent
          opacity={1}
          roughness={0.55}
          metalness={0.18}
          emissive="#2a2a2a"
          emissiveIntensity={0.08}
        />
      </mesh>
      <pointLight ref={onLightRef} position={[0, -0.18, 0]} color="#ff8a00" intensity={0} distance={1.8} />
    </group>
  )
}

export default function RocketCinematic({
  earthCanvasRef,
}: {
  earthCanvasRef: RefObject<HTMLDivElement | null>
}) {
  const isLaunching = useLaunchStore((state) => state.isLaunching)
  const completeLaunch = useLaunchStore((state) => state.completeLaunch)

  const rocketRef = useRef<THREE.Group | null>(null)
  const bodyMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const noseMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const leftFinMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const rightFinMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const engineGlowRef = useRef<THREE.PointLight | null>(null)
  const tracerLineRef = useRef<THREE.Line>(
    new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        opacity: 0.6,
        transparent: true,
      }),
    ),
  )
  const tracerGeometryRef = useRef<THREE.BufferGeometry | null>(null)
  const tracerMaterialRef = useRef<THREE.LineBasicMaterial | null>(null)
  const particleMeshRefs = useRef<(THREE.Mesh | null)[]>([])
  const elapsedRef = useRef(0)
  const launchingRef = useRef(false)
  const particlesRef = useRef<LaunchParticle[]>([])
  const tracerPointsRef = useRef<number[]>([])
  const lastEmissionTimeRef = useRef(0)

  function syncRocketOpacity(opacity: number) {
    for (const material of [
      bodyMaterialRef.current,
      noseMaterialRef.current,
      leftFinMaterialRef.current,
      rightFinMaterialRef.current,
    ]) {
      if (!material) {
        continue
      }

      material.opacity = opacity
      material.needsUpdate = true
    }

    if (tracerMaterialRef.current) {
      tracerMaterialRef.current.opacity = opacity * 0.6
      tracerMaterialRef.current.needsUpdate = true
    }
  }

  function clearTracer() {
    tracerPointsRef.current = []

    if (tracerGeometryRef.current) {
      tracerGeometryRef.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([], 3),
      )
      tracerGeometryRef.current.computeBoundingSphere()
    }
  }

  function syncTracer(y: number) {
    tracerPointsRef.current.push(LAUNCH_X, y, LAUNCH_Z)

    if (tracerPointsRef.current.length / 3 > MAX_TRACER_POINTS) {
      tracerPointsRef.current.splice(0, 3)
    }

    if (tracerGeometryRef.current) {
      tracerGeometryRef.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(tracerPointsRef.current, 3),
      )
      tracerGeometryRef.current.computeBoundingSphere()
    }
  }

  function syncParticles() {
    for (let index = 0; index < MAX_PARTICLES; index += 1) {
      const mesh = particleMeshRefs.current[index]
      const particle = particlesRef.current[index]

      if (!mesh) {
        continue
      }

      if (!particle) {
        mesh.visible = false
        continue
      }

      mesh.visible = true
      mesh.position.set(particle.x, particle.y, particle.z)
      mesh.scale.setScalar(particle.size)

      const material = mesh.material as THREE.MeshStandardMaterial
      material.color.set(particle.color)
      material.opacity = Math.max(0, 1 - particle.life / particle.maxLife)
      material.needsUpdate = true
    }
  }

  function resetCinematic() {
    launchingRef.current = false
    elapsedRef.current = 0
    lastEmissionTimeRef.current = 0
    particlesRef.current = []
    clearTracer()
    syncRocketOpacity(1)
    syncParticles()

    if (rocketRef.current) {
      rocketRef.current.visible = false
      rocketRef.current.position.set(LAUNCH_X, LAUNCH_Y, LAUNCH_Z)
    }

    if (engineGlowRef.current) {
      engineGlowRef.current.intensity = 0
    }
  }

  useEffect(() => {
    if (!earthCanvasRef.current) {
      return
    }
  }, [earthCanvasRef])

  useEffect(() => {
    const tracerLine = tracerLineRef.current
    tracerGeometryRef.current = tracerLine.geometry as THREE.BufferGeometry
    tracerMaterialRef.current = tracerLine.material as THREE.LineBasicMaterial

    return () => {
      tracerLine.geometry.dispose()
      ;(tracerLine.material as THREE.LineBasicMaterial).dispose()
    }
  }, [])

  useEffect(() => {
    if (!isLaunching) {
      return
    }

    launchingRef.current = true
    elapsedRef.current = 0
    lastEmissionTimeRef.current = 0
    particlesRef.current = []
    clearTracer()
    syncRocketOpacity(1)

    if (rocketRef.current) {
      rocketRef.current.visible = true
      rocketRef.current.position.set(LAUNCH_X, LAUNCH_Y, LAUNCH_Z)
    }

    if (engineGlowRef.current) {
      engineGlowRef.current.intensity = 0
    }
  }, [isLaunching])

  useFrame((_, delta) => {
    if (!launchingRef.current) {
      return
    }

    elapsedRef.current += delta

    const elapsed = elapsedRef.current
    const rocket = rocketRef.current

    if (!rocket) {
      return
    }

    let currentY = LAUNCH_Y

    if (elapsed <= IGNITION_DURATION) {
      const ignitionProgress = elapsed / IGNITION_DURATION
      const pulse = Math.abs(Math.sin(ignitionProgress * Math.PI * 3))

      if (engineGlowRef.current) {
        engineGlowRef.current.intensity = pulse * 4.5
      }
    } else {
      const t = Math.min((elapsed - IGNITION_DURATION) / LAUNCH_DURATION, 1)
      currentY = LAUNCH_Y + Math.pow(t, 1.8) * 6
      rocket.position.y = currentY

      if (engineGlowRef.current) {
        engineGlowRef.current.intensity = 3.4
      }
    }

    if (elapsed >= 2.5) {
      const fadeProgress = Math.min((elapsed - 2.5) / 0.5, 1)
      syncRocketOpacity(1 - fadeProgress)
    } else {
      syncRocketOpacity(1)
    }

    if (elapsed >= IGNITION_DURATION) {
      syncTracer(currentY)
    }

    const rocketBaseY = rocket.position.y - 0.18

    if (elapsed - lastEmissionTimeRef.current >= 1 / 60) {
      lastEmissionTimeRef.current = elapsed
      const particleCount = 3 + Math.floor(Math.random() * 3)

      for (let index = 0; index < particleCount; index += 1) {
        particlesRef.current.push({
          x: LAUNCH_X,
          y: rocketBaseY,
          z: LAUNCH_Z,
          vx: (Math.random() - 0.5) * 0.04,
          vy: -0.07 - Math.random() * 0.03,
          vz: (Math.random() - 0.5) * 0.04,
          life: 0,
          maxLife: 0.4,
          size: 0.02 + Math.random() * 0.02,
          color: Math.random() > 0.5 ? '#FF6600' : '#FFFFFF',
        })
      }
    }

    particlesRef.current = particlesRef.current
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        z: particle.z + particle.vz,
        life: particle.life + delta,
      }))
      .filter((particle) => particle.life < particle.maxLife)
      .slice(0, MAX_PARTICLES)

    syncParticles()

    if (elapsed >= TOTAL_DURATION) {
      resetCinematic()
      completeLaunch()
    }
  })

  return (
    <group>
      <RocketMesh
        onGroupRef={(node) => {
          rocketRef.current = node
        }}
        onBodyMaterialRef={(node) => {
          bodyMaterialRef.current = node
        }}
        onNoseMaterialRef={(node) => {
          noseMaterialRef.current = node
        }}
        onLeftFinMaterialRef={(node) => {
          leftFinMaterialRef.current = node
        }}
        onRightFinMaterialRef={(node) => {
          rightFinMaterialRef.current = node
        }}
        onLightRef={(node) => {
          engineGlowRef.current = node
        }}
      />

      <primitive object={tracerLineRef.current} visible={isLaunching} />

      {Array.from({ length: MAX_PARTICLES }).map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            particleMeshRefs.current[index] = node
          }}
          visible={false}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
