import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DebrisParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  size: number;
  color: THREE.Color;
}

interface DebrisFieldProps {
  count?: number;
  scrollY?: number;
}

// Small debris particles that orbit between asteroids
const DebrisField: React.FC<DebrisFieldProps> = ({ count = 500, scrollY = 0 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<THREE.BufferGeometry>(null);

  const particles = useMemo<DebrisParticle[]>(() => {
    const temp: DebrisParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 20;
      const height = (Math.random() - 0.5) * 8;
      
      temp.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.02
        ),
        rotationSpeed: new THREE.Vector3(
          Math.random() * 0.1,
          Math.random() * 0.1,
          Math.random() * 0.1
        ),
        size: 0.02 + Math.random() * 0.05,
        color: new THREE.Color().setHSL(
          0.05 + Math.random() * 0.1, // Orange to brown hues
          0.3 + Math.random() * 0.4,
          0.3 + Math.random() * 0.3
        )
      });
    }
    
    return temp;
  }, [count]);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    const sizes = new Float32Array(particles.length);
    
    particles.forEach((particle, i) => {
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      colors[i * 3] = particle.color.r;
      colors[i * 3 + 1] = particle.color.g;
      colors[i * 3 + 2] = particle.color.b;
      
      sizes[i] = particle.size;
    });
    
    return { positions, colors, sizes };
  }, [particles]);

  useFrame((state) => {
    if (!pointsRef.current || !particlesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionAttribute = particlesRef.current.getAttribute('position');
    
    particles.forEach((particle, i) => {
      // Orbital motion
      const orbitSpeed = 0.001;
      const angle = Math.atan2(particle.position.z, particle.position.x) + orbitSpeed;
      const radius = Math.sqrt(
        particle.position.x ** 2 + particle.position.z ** 2
      );
      
      particle.position.x = Math.cos(angle) * radius;
      particle.position.z = Math.sin(angle) * radius;
      
      // Add velocity for drift
      particle.position.add(particle.velocity);
      
      // Vertical oscillation
      particle.position.y += Math.sin(time + i * 0.1) * 0.001;
      
      // Parallax
      particle.position.y -= scrollY * 0.00015;
      
      // Boundary check - reset if too far
      if (particle.position.length() > 30) {
        const newAngle = Math.random() * Math.PI * 2;
        const newRadius = 5 + Math.random() * 15;
        particle.position.set(
          Math.cos(newAngle) * newRadius,
          (Math.random() - 0.5) * 8,
          Math.sin(newAngle) * newRadius
        );
      }
      
      positionAttribute.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
    });
    
    positionAttribute.needsUpdate = true;
    
    // Rotate entire field
    pointsRef.current.rotation.y = time * 0.005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={particlesRef}>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default DebrisField;
