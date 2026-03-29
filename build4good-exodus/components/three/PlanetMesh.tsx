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
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { gl } = useThree()
  const texture = useTexture(textureUrl ?? FALLBACK_TEXTURE_URL)
  const hasTexture = textureUrl !== null

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

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[radius, 64, 64]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {hasTexture ? (
          <meshPhysicalMaterial
            map={texture}
            color="#ffffff"
            roughness={0.94}
            metalness={0.02}
            clearcoat={0.04}
            clearcoatRoughness={0.9}
            emissive="#0d0d0d"
            emissiveIntensity={isSelected ? 0.14 : hovered ? 0.08 : 0.03}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.1}
            emissive={color}
            emissiveIntensity={isSelected ? 0.15 : hovered ? 0.1 : 0.05}
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
