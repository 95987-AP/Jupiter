import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Moon } from '../types';

interface GalileanMoonsSystemProps {
  scrollY: number;
  currentMoonIndex: number;
  moons: Moon[];
}

// Moon orbital positions - positioned to be visible as camera moves
const MOON_ORBITAL_POSITIONS = [
  { x: 5, y: 0.5, z: 2, size: 0.8 },    // Io - closest, volcanic
  { x: 8, y: 0.3, z: 3, size: 0.7 },    // Europa - icy
  { x: 11, y: 0.1, z: 4, size: 1.1 },   // Ganymede - largest moon
  { x: 14, y: -0.2, z: 5, size: 1.0 },  // Callisto - cratered
];

// Atmosphere colors for each moon
const MOON_ATMOSPHERE_COLORS: Record<string, string> = {
  io: '#FFD700',       // Golden/volcanic
  europa: '#87CEEB',   // Ice blue
  ganymede: '#A0A0A0', // Gray
  callisto: '#8B7355', // Brown/gray
};

// Surface shader
const surfaceVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const surfaceFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uSunDirection;
  uniform vec3 uAtmosphereColor;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec4 textureColor = texture2D(uTexture, vUv);
    
    // Diffuse lighting
    float diffuse = max(dot(vNormal, normalize(uSunDirection)), 0.0);
    diffuse = diffuse * 0.8 + 0.2;
    
    // Fresnel rim lighting
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
    
    vec3 finalColor = textureColor.rgb * diffuse;
    finalColor += uAtmosphereColor * fresnel * 0.3;
    
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

// Atmosphere shader
const atmosphereVertexShader = `
  varying vec3 vNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 uAtmosphereColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    vec3 color = uAtmosphereColor * intensity * 1.5;
    float alpha = intensity * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

interface MoonMeshProps {
  moonId: string;
  texture: string;
  atmosphereColor: string;
  position: THREE.Vector3;
  scale: number;
  opacity: number;
  orbitSpeed: number;
  isActive: boolean;
}

const MoonMesh: React.FC<MoonMeshProps> = ({
  moonId,
  texture,
  atmosphereColor,
  position,
  scale,
  opacity,
  orbitSpeed,
  isActive,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);
  const currentScale = useRef(scale);
  const currentOpacity = useRef(opacity);

  useEffect(() => {
    if (!texture) return;
    
    const loader = new THREE.TextureLoader();
    loader.load(
      texture,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        setLoadedTexture(tex);
        console.log(`✅ Loaded texture for ${moonId}`);
      },
      undefined,
      (err) => console.error(`❌ Error loading ${moonId} texture:`, err)
    );
  }, [texture, moonId]);

  const surfaceMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uSunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
        uAtmosphereColor: { value: new THREE.Color(atmosphereColor) },
      },
      vertexShader: surfaceVertexShader,
      fragmentShader: surfaceFragmentShader,
      transparent: true,
    });
  }, [atmosphereColor]);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uAtmosphereColor: { value: new THREE.Color(atmosphereColor) },
        uOpacity: { value: 0.5 },
      },
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [atmosphereColor]);

  useEffect(() => {
    if (loadedTexture && surfaceMaterial) {
      surfaceMaterial.uniforms.uTexture.value = loadedTexture;
    }
  }, [loadedTexture, surfaceMaterial]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Smooth scale and opacity transitions with faster lerp for responsive feel
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, scale, 0.15);
    currentOpacity.current = THREE.MathUtils.lerp(currentOpacity.current, opacity, 0.15);

    if (meshRef.current) {
      // Rotation - faster when active
      const rotSpeed = isActive ? 0.08 : 0.03;
      meshRef.current.rotation.y = time * rotSpeed;
      
      // Gentle tilt animation
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }

    if (surfaceMaterial) {
      surfaceMaterial.uniforms.uTime.value = time;
      surfaceMaterial.uniforms.uOpacity.value = currentOpacity.current;
    }

    if (atmosphereMaterial) {
      atmosphereMaterial.uniforms.uOpacity.value = currentOpacity.current * 0.6;
    }

    if (groupRef.current) {
      // Orbital motion around Jupiter
      const angle = time * orbitSpeed;
      const orbitRadius = position.x;
      
      groupRef.current.position.set(
        Math.cos(angle) * orbitRadius,
        position.y + Math.sin(time * 0.3) * 0.2, // Subtle vertical wobble
        Math.sin(angle) * orbitRadius * 0.3 // Elliptical orbit
      );
      
      groupRef.current.scale.setScalar(currentScale.current);
    }
  });

  if (!loadedTexture) return null;

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={surfaceMaterial} />
      </mesh>
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>
      {/* Glow effect for active moon */}
      {isActive && (
        <pointLight
          color={atmosphereColor}
          intensity={currentOpacity.current * 2}
          distance={15}
          decay={2}
        />
      )}
    </group>
  );
};

const GalileanMoonsSystem: React.FC<GalileanMoonsSystemProps> = ({
  scrollY,
  currentMoonIndex,
  moons,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate positions and opacities based on scroll
  const moonStates = useMemo(() => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    
    // Jupiter section ends at 30%, then moon sections
    const jupiterEnd = 0.30;
    const moonSectionSize = 0.175; // ~17.5% each
    
    return moons.map((moon, index) => {
      const orbital = MOON_ORBITAL_POSITIONS[index];
      
      // Moons visible once we pass Jupiter section
      const pastJupiter = scrollProgress > jupiterEnd - 0.05;
      
      // Each moon has peak visibility window
      const moonCenter = jupiterEnd + (index * moonSectionSize) + (moonSectionSize / 2);
      const distanceFromCenter = Math.abs(scrollProgress - moonCenter);
      
      // Base opacity - all moons visible after Jupiter, but dimmed
      let opacity = pastJupiter ? 0.25 : 0;
      
      // Boost opacity when in moon's section
      if (distanceFromCenter < moonSectionSize * 0.6) {
        opacity = 1 - (distanceFromCenter / (moonSectionSize * 0.6)) * 0.4;
      } else if (distanceFromCenter < moonSectionSize) {
        opacity = 0.6 - ((distanceFromCenter - moonSectionSize * 0.6) / (moonSectionSize * 0.4)) * 0.35;
      }
      
      // Scale based on active state
      const isActive = currentMoonIndex === index;
      const baseScale = orbital.size;
      const activeScale = isActive ? baseScale * 1.8 : baseScale * 1.2;
      
      // Orbital speed varies per moon
      const orbitSpeed = 0.08 - (index * 0.012);
      
      return {
        moon,
        basePosition: new THREE.Vector3(orbital.x, orbital.y, orbital.z),
        opacity: Math.max(0.1, Math.min(1, opacity)),
        scale: activeScale,
        orbitSpeed,
        atmosphereColor: MOON_ATMOSPHERE_COLORS[moon.id] || '#ffffff',
        isActive,
      };
    });
  }, [currentMoonIndex, moons, scrollY]);

  return (
    <group ref={groupRef}>
      {moonStates.map((state) => (
        <MoonMesh
          key={state.moon.id}
          moonId={state.moon.id}
          texture={state.moon.texture || ''}
          atmosphereColor={state.atmosphereColor}
          position={state.basePosition}
          scale={state.scale}
          opacity={state.opacity}
          orbitSpeed={state.orbitSpeed}
          isActive={state.isActive}
        />
      ))}
    </group>
  );
};

export default GalileanMoonsSystem;
