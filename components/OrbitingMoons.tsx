import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Moon {
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: THREE.Color;
  angle: number;
  texturePath: string;
}

interface OrbitingMoonsProps {
  scrollY?: number;
}

// Single moon component with texture
const MoonWithTexture: React.FC<{
  moon: Moon;
  index: number;
  moonRef: (el: THREE.Mesh | null) => void;
  scrollProgress: number;
}> = ({ moon, index, moonRef, scrollProgress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    console.log(`🔄 Loading texture for ${moon.name}: ${moon.texturePath}`);
    
    loader.load(
      moon.texturePath,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.anisotropy = 16;
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        setTexture(loadedTexture);
        console.log(`✅ Loaded texture for ${moon.name}`);
      },
      undefined,
      (error) => {
        console.error(`❌ Error loading texture for ${moon.name}:`, error);
      }
    );
  }, [moon.texturePath, moon.name]);

  // Update material when texture loads
  useEffect(() => {
    if (meshRef.current && texture) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.map = texture;
      material.needsUpdate = true;
      console.log(`🎨 Applied texture to ${moon.name} material`);
    }
  }, [texture, moon.name]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      // TIME-BASED orbital motion
      const orbitAngle = time * moon.orbitSpeed * 0.01;
      
      // Calculate position with elliptical orbit
      const eccentricity = 0.05 + index * 0.02;
      const x = Math.cos(moon.angle + orbitAngle) * moon.orbitRadius * (1 + eccentricity);
      const z = Math.sin(moon.angle + orbitAngle) * moon.orbitRadius * (1 - eccentricity);
      const y = Math.sin(time * 0.5 + index) * 0.3 + Math.cos(time * 0.3 + index * 2) * 0.1;
      
      meshRef.current.position.set(x, y, z);
      
      // Rotate moon with realistic spin
      meshRef.current.rotation.y = time * (0.3 + index * 0.1);
      meshRef.current.rotation.x = Math.sin(time + index) * 0.15;
      meshRef.current.rotation.z = Math.cos(time * 0.5 + index) * 0.05;
      
      // Pulsing scale effect
      const pulseScale = 1 + Math.sin(time * 2 + index * Math.PI * 0.5) * 0.05;
      meshRef.current.scale.setScalar(pulseScale);
      
      // Update material opacity
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.opacity = THREE.MathUtils.lerp(1, 0, scrollProgress);
      }
    }
  });

  return (
    <group>
      <mesh
        ref={(el) => {
          meshRef.current = el;
          moonRef(el);
        }}
      >
        <sphereGeometry args={[moon.radius, 48, 48]} />
        <meshStandardMaterial
          map={texture || undefined}
          color={texture ? '#ffffff' : moon.color}
          emissive={moon.color}
          emissiveIntensity={texture ? 0.15 : 0.3}
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={1}
        />
      </mesh>
      
      {/* Moon atmosphere glow */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[moon.radius, 32, 32]} />
        <meshBasicMaterial
          color={moon.color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Moon glow light */}
      <pointLight
        color={moon.color}
        intensity={0.6}
        distance={3}
        decay={2}
      />
    </group>
  );
};

// Orbiting moons with zoom parallax effect
const OrbitingMoons: React.FC<OrbitingMoonsProps> = ({ scrollY = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const moonRefs = useRef<Array<THREE.Mesh | null>>([]);
  const orbitLinesRef = useRef<Array<THREE.Line | null>>([]);
  const smoothScrollY = useRef(scrollY);

  // Galilean moons data
  const moons = useMemo<Moon[]>(() => [
    {
      name: 'Io',
      radius: 0.15,
      orbitRadius: 4,
      orbitSpeed: 0.8,
      color: new THREE.Color(0xFFD700),
      angle: 0,
      texturePath: '/Jupiter/textures/Moons/io-moon.jpg'
    },
    {
      name: 'Europa',
      radius: 0.13,
      orbitRadius: 5.2,
      orbitSpeed: 0.5,
      color: new THREE.Color(0xD6EAF8),
      angle: Math.PI * 0.5,
      texturePath: '/Jupiter/textures/Moons/europa-moon.jpg'
    },
    {
      name: 'Ganymede',
      radius: 0.18,
      orbitRadius: 6.5,
      orbitSpeed: 0.3,
      color: new THREE.Color(0xAAB7B8),
      angle: Math.PI,
      texturePath: '/Jupiter/textures/Moons/ganymede-moon.jpg'
    },
    {
      name: 'Callisto',
      radius: 0.16,
      orbitRadius: 8,
      orbitSpeed: 0.2,
      color: new THREE.Color(0x8B7355),
      angle: Math.PI * 1.5,
      texturePath: '/Jupiter/textures/Moons/callisto-moon.jpg'
    }
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Smooth scroll interpolation
    smoothScrollY.current = THREE.MathUtils.lerp(smoothScrollY.current, scrollY, 0.08);
    
    // Calculate scroll progress with smooth value
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollProgress = Math.min(smoothScrollY.current / maxScroll, 1);
    
    if (groupRef.current) {
      // Fade out moons as we zoom in to Jupiter
      groupRef.current.visible = scrollProgress < 0.7;
      
      // Scale moons based on zoom
      const scaleValue = THREE.MathUtils.lerp(1, 0.5, scrollProgress);
      groupRef.current.scale.setScalar(scaleValue);
    }
    
    // Update orbit line opacity with smooth fade
    orbitLinesRef.current.forEach((line, i) => {
      if (line && line.material instanceof THREE.LineBasicMaterial) {
        const baseOpacity = 0.2 - i * 0.02;
        line.material.opacity = THREE.MathUtils.lerp(baseOpacity, 0, scrollProgress);
        
        // Subtle rotation of orbit lines
        line.rotation.y = time * 0.01 * (i + 1) * 0.1;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Orbit lines with glow effect */}
      {moons.map((moon, i) => {
        const points: THREE.Vector3[] = [];
        const segments = 128; // More segments for smoother lines
        const eccentricity = 0.05 + i * 0.02;
        
        for (let j = 0; j <= segments; j++) {
          const angle = (j / segments) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(angle) * moon.orbitRadius * (1 + eccentricity),
              Math.sin(angle * 4) * 0.05, // Slight wave
              Math.sin(angle) * moon.orbitRadius * (1 - eccentricity)
            )
          );
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line
            key={`orbit-${moon.name}`}
            geometry={geometry}
            material={
              new THREE.LineBasicMaterial({
                color: moon.color,
                transparent: true,
                opacity: 0.18,
                blending: THREE.AdditiveBlending
              })
            }
            ref={(el: THREE.Line | null) => { 
              if (el) orbitLinesRef.current[i] = el; 
            }}
          />
        );
      })}
      
      {/* Moons with textures */}
      {moons.map((moon, i) => (
        <MoonWithTexture
          key={moon.name}
          moon={moon}
          index={i}
          moonRef={(el) => { if (el) moonRefs.current[i] = el; }}
          scrollProgress={Math.min(smoothScrollY.current / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1), 1)}
        />
      ))}
    </group>
  );
};

export default OrbitingMoons;
