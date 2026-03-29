'use client'

import { useEffect, useMemo, useRef } from 'react'
import { OrbitControls, Points, PointMaterial, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useAppStore } from '@/store/useAppStore'

const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0, 30)
const DEFAULT_LOOK_AT = new THREE.Vector3(0, 0, 0)

export function StarField({ children }: { children?: React.ReactNode }) {
  const selectedPlanetId = useAppStore(s => s.selectedPlanet?.id ?? null)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60, near: 0.1, far: 1000 }}
      style={{ background: '#000000' }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#000000', 1)
        scene.fog = new THREE.FogExp2('#000000', 0.0012)
      }}
    >
      {/* Keep lighting low so the background stays dark */}
      <ambientLight intensity={0.025} />

      <directionalLight
        position={[12, 10, 8]}
        intensity={1.15}
        color="#ffffff"
      />

      <pointLight
        position={[-18, -8, -12]}
        intensity={0.16}
        color="#7fc8ff"
      />

      <pointLight
        position={[0, 14, -10]}
        intensity={0.08}
        color="#ffb36b"
      />

      <CameraLight />

      {/* Main bright crisp star field */}
      <Stars
        radius={320}
        depth={90}
        count={9000}
        factor={6.5}
        saturation={0}
        fade={false}
        speed={0.18}
      />

      {/* Extra micro-stars to make space feel dense */}
      <SmallStarLayer count={7000} radius={260} />

      {/* Occasional brighter stars for sparkle */}
      <BigStarLayer count={180} radius={220} />

      <CameraResetController
        controlsRef={controlsRef}
        selectedPlanetId={selectedPlanetId}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableZoom
        enablePan
        enableDamping
        screenSpacePanning
        zoomSpeed={0.45}
        rotateSpeed={0.32}
        panSpeed={0.65}
        dampingFactor={0.07}
        minDistance={2}
        maxDistance={160}
      />

      {children}
    </Canvas>
  )
}

function CameraLight() {
  const { camera } = useThree()
  const lightRef = useRef<THREE.PointLight>(null)
  const lightOffset = useRef(new THREE.Vector3(0, 0, 3))

  useFrame(() => {
    if (!lightRef.current) {
      return
    }

    lightRef.current.position.copy(camera.position).add(lightOffset.current)
  })

  return (
    <pointLight
      ref={lightRef}
      intensity={0.7}
      distance={120}
      decay={1.5}
      color="#f5f8ff"
    />
  )
}

function SmallStarLayer({
  count = 5000,
  radius = 200,
}: {
  count?: number
  radius?: number
}) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const r = radius * (0.35 + Math.random() * 0.65)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }

    return arr
  }, [count, radius])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.003
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.015
  })

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.95}
      />
    </Points>
  )
}

function BigStarLayer({
  count = 120,
  radius = 180,
}: {
  count?: number
  radius?: number
}) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const r = radius * (0.5 + Math.random() * 0.5)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }

    return arr
  }, [count, radius])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = -state.clock.elapsedTime * 0.0015
  })

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.16}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  )
}

function CameraResetController({
  controlsRef,
  selectedPlanetId,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>
  selectedPlanetId: string | null
}) {
  const { camera } = useThree()
  const shouldResetRef = useRef(false)
  const previousSelectionRef = useRef<string | null>(selectedPlanetId)

  useEffect(() => {
    if (previousSelectionRef.current && !selectedPlanetId) {
      shouldResetRef.current = true
    }

    previousSelectionRef.current = selectedPlanetId
  }, [selectedPlanetId])

  useFrame(() => {
    if (!shouldResetRef.current) return

    camera.position.lerp(DEFAULT_CAMERA_POSITION, 0.08)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(DEFAULT_LOOK_AT, 0.08)
      controlsRef.current.update()
    } else {
      camera.lookAt(DEFAULT_LOOK_AT)
    }

    if (camera.position.distanceTo(DEFAULT_CAMERA_POSITION) > 0.08) {
      return
    }

    camera.position.copy(DEFAULT_CAMERA_POSITION)

    if (controlsRef.current) {
      controlsRef.current.target.copy(DEFAULT_LOOK_AT)
      controlsRef.current.update()
    } else {
      camera.lookAt(DEFAULT_LOOK_AT)
    }

    shouldResetRef.current = false
  })

  return null
}
