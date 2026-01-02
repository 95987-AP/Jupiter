import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Moon3DInlineProps {
  texture: string;
  atmosphereColor: string;
  moonName: string;
}

// Shared geometry to reduce memory
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32); // Reduced from 64x64
const atmosphereGeometry = new THREE.SphereGeometry(1, 16, 16); // Reduced from 32x32

// Simplified - use standard materials instead of custom shaders for better performance

const MoonSphere: React.FC<{ texture: string; atmosphereColor: string }> = memo(({ 
  texture, 
  atmosphereColor 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!texture) return;
    
    const loader = new THREE.TextureLoader();
    loader.load(
      texture,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4; // Reduced from 16 for performance
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        setLoadedTexture(tex);
      },
      undefined,
      (err) => console.error(`Error loading texture:`, err)
    );
  }, [texture]);

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth, constant rotation around Y axis only - like a real celestial body
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = time * 0.15; // Natural rotation speed
    }
  });

  if (!loadedTexture) {
    return (
      <mesh>
        <primitive object={sphereGeometry} attach="geometry" />
        <meshStandardMaterial color={atmosphereColor} roughness={0.8} metalness={0.1} />
      </mesh>
    );
  }

  return (
    <group>
      {/* Main moon surface */}
      <mesh ref={meshRef}>
        <primitive object={sphereGeometry} attach="geometry" />
        <meshStandardMaterial 
          map={loadedTexture}
          roughness={0.85}
          metalness={0.05}
          emissive={atmosphereColor}
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* Atmosphere glow - simplified */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <primitive object={atmosphereGeometry} attach="geometry" />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
});

MoonSphere.displayName = 'MoonSphere';

const Moon3DInline: React.FC<Moon3DInlineProps> = memo(({ 
  texture, 
  atmosphereColor,
  moonName 
}) => {
  return (
    <div className="aspect-square w-full max-w-md mx-auto">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ 
          antialias: false, // Disabled for performance
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={Math.min(window.devicePixelRatio, 1.5)} // Cap at 1.5x
        frameloop="always" // Continuous rendering for smooth rotation
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#FFF8E7" />
        
        <MoonSphere texture={texture} atmosphereColor={atmosphereColor} />
      </Canvas>
    </div>
  );
});

Moon3DInline.displayName = 'Moon3DInline';

export default Moon3DInline;
