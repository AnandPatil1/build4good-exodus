'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sphere, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const FALLBACK_TEXTURE_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sN6by8AAAAASUVORK5CYII='

interface PlanetMeshProps {
  position: [number, number, number]
  radius: number
  color: string
  textureUrl?: string | null
  isSelected: boolean
  label?: string
  onClick: () => void
}

export function PlanetMesh({
  position,
  radius,
  color,
  textureUrl = null,
  isSelected,
  label,
  onClick,
}: PlanetMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { gl, camera } = useThree()
  const controls = useThree(state => state.controls as unknown as {
    enabled?: boolean
    target: THREE.Vector3
    update: () => void
  } | undefined)
  const texture = useTexture(textureUrl ?? FALLBACK_TEXTURE_URL)
  const hasTexture = textureUrl !== null
  const targetLookAt = useRef(new THREE.Vector3(...position))
  const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 30))
  const cursorRotation = useRef(new THREE.Vector2(0, 0))
  const spinRotationY = useRef(0)
  const worldPosition = useRef(new THREE.Vector3(...position))
  const previousSelectedRef = useRef(isSelected)
  const isZoomAnimatingRef = useRef(false)

  useEffect(() => {
    if (!hasTexture) {
      return
    }

    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = true
    texture.needsUpdate = true
  }, [gl, hasTexture, texture])

  useEffect(() => {
    if (isSelected && !previousSelectedRef.current) {
      isZoomAnimatingRef.current = true

      if (controls) {
        controls.enabled = false
      }
    }

    previousSelectedRef.current = isSelected
  }, [controls, isSelected])

  useFrame((_, delta) => {
    if (meshRef.current) {
      spinRotationY.current += delta * 0.1
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, cursorRotation.current.y, 0.08)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        spinRotationY.current + cursorRotation.current.x,
        0.08,
      )
    }

    if (isZoomAnimatingRef.current && groupRef.current) {
      groupRef.current.getWorldPosition(targetLookAt.current)
      targetCameraPosition.current.copy(targetLookAt.current).add(new THREE.Vector3(0, 0, Math.max(radius * 8, 3.5)))
      camera.position.lerp(targetCameraPosition.current, 0.05)
      camera.lookAt(targetLookAt.current)

      if (controls) {
        controls.target.lerp(targetLookAt.current, 0.08)
        controls.update()
      }

      if (camera.position.distanceTo(targetCameraPosition.current) <= 0.08) {
        isZoomAnimatingRef.current = false

        if (controls) {
          controls.target.copy(targetLookAt.current)
          controls.enabled = true
          controls.update()
        }
      }
    }

    if (!isSelected && isZoomAnimatingRef.current) {
      isZoomAnimatingRef.current = false

      if (controls) {
        controls.enabled = true
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Sphere
        ref={meshRef}
        args={[radius, 64, 64]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerMove={(event) => {
          if (!groupRef.current) {
            return
          }

          groupRef.current.getWorldPosition(worldPosition.current)
          cursorRotation.current.x = THREE.MathUtils.clamp((event.point.x - worldPosition.current.x) / (radius * 3), -0.45, 0.45)
          cursorRotation.current.y = THREE.MathUtils.clamp(-(event.point.y - worldPosition.current.y) / (radius * 3), -0.3, 0.3)
        }}
        onPointerOut={() => {
          setHovered(false)
          cursorRotation.current.set(0, 0)
        }}
      >
        {hasTexture ? (
          <meshPhysicalMaterial
            map={texture}
            color="#ffffff"
            roughness={0.82}
            metalness={0.02}
            clearcoat={0.04}
            clearcoatRoughness={0.9}
            emissive="#1a1a1a"
            emissiveIntensity={isSelected ? 0.24 : hovered ? 0.16 : 0.08}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={0.68}
            metalness={0.1}
            emissive={color}
            emissiveIntensity={isSelected ? 0.28 : hovered ? 0.2 : 0.12}
          />
        )}
      </Sphere>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.3, radius * 1.4, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      {(isSelected || hovered) && label && (
        <Html position={[radius + 0.5, radius + 0.5, 0]} center={false}>
          <div className="text-[10px] font-mono text-white whitespace-nowrap bg-neutral-900/80 px-2 py-0.5 border-l border-rose-300">
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}
