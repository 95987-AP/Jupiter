import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Moon {
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: THREE.Color;
  angle: number;
}

interface OrbitingMoonsProps {
  scrollY?: number;
}

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
      angle: 0
    },
    {
      name: 'Europa',
      radius: 0.13,
      orbitRadius: 5.2,
      orbitSpeed: 0.5,
      color: new THREE.Color(0xD6EAF8),
      angle: Math.PI * 0.5
    },
    {
      name: 'Ganymede',
      radius: 0.18,
      orbitRadius: 6.5,
      orbitSpeed: 0.3,
      color: new THREE.Color(0xAAB7B8),
      angle: Math.PI
    },
    {
      name: 'Callisto',
      radius: 0.16,
      orbitRadius: 8,
      orbitSpeed: 0.2,
      color: new THREE.Color(0x8B7355),
      angle: Math.PI * 1.5
    }
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Smooth scroll interpolation - animations run at constant speed regardless of scroll speed
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
      
      // Adjust opacity
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = THREE.MathUtils.lerp(1, 0, scrollProgress);
        }
      });
    }
    
    // Update moon positions - TIME-BASED, not scroll-based for smooth motion
    moonRefs.current.forEach((moonMesh, i) => {
      if (moonMesh && moons[i]) {
        const moon = moons[i];
        
        // TIME-BASED orbital motion - runs smoothly regardless of scroll
        const orbitAngle = time * moon.orbitSpeed * 0.01;
        
        // Calculate position with elliptical orbit
        const eccentricity = 0.05 + i * 0.02; // Slight ellipse
        const x = Math.cos(moon.angle + orbitAngle) * moon.orbitRadius * (1 + eccentricity);
        const z = Math.sin(moon.angle + orbitAngle) * moon.orbitRadius * (1 - eccentricity);
        const y = Math.sin(time * 0.5 + i) * 0.3 + Math.cos(time * 0.3 + i * 2) * 0.1;
        
        moonMesh.position.set(x, y, z);
        
        // Rotate moon with realistic spin
        moonMesh.rotation.y = time * (0.3 + i * 0.1);
        moonMesh.rotation.x = Math.sin(time + i) * 0.15;
        moonMesh.rotation.z = Math.cos(time * 0.5 + i) * 0.05;
        
        // Pulsing scale effect
        const pulseScale = 1 + Math.sin(time * 2 + i * Math.PI * 0.5) * 0.05;
        moonMesh.scale.setScalar(pulseScale);
      }
    });
    
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
          <primitive 
            key={`orbit-${i}`}
            object={new THREE.Line(
              geometry,
              new THREE.LineBasicMaterial({
                color: moon.color,
                transparent: true,
                opacity: 0.18,
                blending: THREE.AdditiveBlending
              })
            )}
            ref={(el: THREE.Line | null) => { 
              if (el) orbitLinesRef.current[i] = el; 
            }}
          />
        );
      })}
      
      {/* Moons with enhanced effects */}
      {moons.map((moon, i) => (
        <group key={moon.name}>
          <mesh
            ref={(el: THREE.Mesh | null) => { 
              if (el) moonRefs.current[i] = el; 
            }}
          >
            <sphereGeometry args={[moon.radius, 48, 48]} />
            <meshStandardMaterial
              color={moon.color}
              emissive={moon.color}
              emissiveIntensity={0.4}
              roughness={0.7}
              metalness={0.15}
              transparent
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
      ))}
    </group>
  );
};

export default OrbitingMoons;
