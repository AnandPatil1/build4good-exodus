'use client'

import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'

export function StarField({ children }: { children?: React.ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.22} />
      <hemisphereLight
        args={['#8dc7ff', '#140f0c', 0.65]}
      />
      <directionalLight
        position={[14, 10, 12]}
        intensity={1.9}
        color="#fff3d6"
      />
      <pointLight
        position={[-18, -6, -10]}
        intensity={0.55}
        color="#7fc8ff"
      />
      <pointLight
        position={[0, 18, -14]}
        intensity={0.35}
        color="#ff8a5c"
      />
      <Stars radius={200} depth={60} count={5000} factor={3} fade speed={0.5} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        zoomSpeed={0.4}
        rotateSpeed={0.3}
        minDistance={15}
        maxDistance={80}
      />
      {children}
    </Canvas>
  )
}
