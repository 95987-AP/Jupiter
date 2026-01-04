import React, { useRef, useMemo, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Create procedural cloud texture
const createCloudTexture = (variant: number = 0): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  const colors = [
    '#FF8C00', '#FFA500', '#FFB347', '#FFCC80', '#FF7043'
  ];
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, colors[variant % colors.length]);
  gradient.addColorStop(0.5, colors[variant % colors.length] + '88');
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

// Dynamic atmospheric particles with wind/storm effects
const AtmosphereParticles: React.FC<{ windIntensity: number }> = ({ windIntensity }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 25000;
  
  const { geometry, material, velocities, bandIndices } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const vel: number[] = [];
    const bands: number[] = [];
    
    // Jupiter atmosphere colors
    const colorPalette = [
      new THREE.Color('#FF8C00'), // Dark orange
      new THREE.Color('#FFB347'), // Light orange
      new THREE.Color('#D2691E'), // Chocolate
      new THREE.Color('#FF6347'), // Tomato
      new THREE.Color('#FFA07A'), // Light salmon
      new THREE.Color('#CD853F'), // Peru
      new THREE.Color('#F4A460'), // Sandy brown
    ];
    
    // Create particles in bands to simulate Jupiter's cloud structure
    for (let i = 0; i < particleCount; i++) {
      // Distribute in bands (zonal flow pattern) - more structured
      const bandIndex = Math.floor(Math.random() * 16); // More bands (16)
      const bandWidth = 180; // Width of each band
      const bandCenter = (bandIndex - 7.5) * bandWidth; // Spread bands vertically
      
      // Position around camera center for immersive experience - closer and lower
      const radius = 200 + Math.random() * 600; // Much closer to camera
      const theta = Math.random() * Math.PI * 2; // Around equator
      
      // More concentrated latitude distribution for visible bands - centered around camera
      const phi = (bandIndex / 16) * Math.PI * 0.6 - Math.PI * 0.3 + (Math.random() - 0.5) * 0.15;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) - 200; // Lower position
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      positions.push(x, y, z);
      
      // Color based on band with slight variation
      const color = colorPalette[bandIndex % colorPalette.length];
      const colorVariation = 0.9 + Math.random() * 0.2;
      colors.push(color.r * colorVariation, color.g * colorVariation, color.b * colorVariation);
      
      // Varying particle sizes - smaller for more wind-like appearance
      sizes.push(8 + Math.random() * 15);
      
      // Velocity for wind effect (zonal winds flow horizontally)
      // Alternating directions in bands with more variation
      const baseWindSpeed = 0.5 + Math.random() * 0.8;
      const windDirection = bandIndex % 2 === 0 ? 1 : -1;
      const windSpeed = baseWindSpeed * windDirection;
      vel.push(windSpeed, 0, 0);
      
      bands.push(bandIndex);
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const mat = new THREE.PointsMaterial({
      size: 20,
      vertexColors: true,
      map: createCloudTexture(0),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.7,
    });
    
    return {
      geometry: geo,
      material: mat,
      velocities: vel,
      bandIndices: bands
    };
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      // Wind intensity multiplier (1 = normal, up to 5 = intense storm)
      const windMultiplier = 1 + (windIntensity * 4);
      
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const bandIndex = bandIndices[i];
        
        // Add zonal wind movement (horizontal flow) - intensified
        positions[idx] += velocities[i * 3] * 0.8 * windMultiplier;
        
        // Add structured wave motion for wind streams
        const wavePhase = time * 1.5 + bandIndex * 0.3;
        const waveAmplitude = 8 * windMultiplier;
        positions[idx + 1] += Math.sin(wavePhase + i * 0.001) * 0.5 * windMultiplier;
        positions[idx + 2] += Math.cos(wavePhase + i * 0.001) * 1.2 * windMultiplier;
        
        // Add turbulence within bands
        const turbulenceX = Math.sin(time * 0.8 + bandIndex * 0.5) * 0.3;
        const turbulenceY = Math.cos(time * 0.6 + bandIndex * 0.4) * 0.2;
        positions[idx] += turbulenceX * windMultiplier;
        positions[idx + 1] += turbulenceY * windMultiplier;
        
        // Add spiral motion during intense wind - more pronounced
        if (windIntensity > 0.3) {
          const spiralStrength = windIntensity * 0.015;
          const angle = time * 2.5 + i * 0.0008;
          positions[idx] += Math.cos(angle) * spiralStrength * 8;
          positions[idx + 2] += Math.sin(angle) * spiralStrength * 8;
        }
        
        // Keep particles in bounds and wrap around
        const radius = Math.sqrt(
          positions[idx] ** 2 +
          positions[idx + 1] ** 2 +
          positions[idx + 2] ** 2
        );
        
        // If too far or too close, reset to maintain band structure
        if (radius > 900 || radius < 100) {
          const bandWidth = 180;
          const newRadius = 200 + Math.random() * 400;
          const theta = Math.atan2(positions[idx + 2], positions[idx]);
          const phi = (bandIndex / 16) * Math.PI * 0.6 - Math.PI * 0.3 + (Math.random() - 0.5) * 0.15;
          
          positions[idx] = newRadius * Math.sin(phi) * Math.cos(theta);
          positions[idx + 1] = newRadius * Math.cos(phi) - 200;
          positions[idx + 2] = newRadius * Math.sin(phi) * Math.sin(theta);
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Gentle rotation of entire system - faster during intense wind
      pointsRef.current.rotation.y = time * (0.025 + windIntensity * 0.04);
    }
  });
  
  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// Jupiter sphere with real texture
const JupiterSphere: React.FC<{ windIntensity: number }> = ({ windIntensity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/Jupiter/textures/2k_jupiter.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[-1800, 0, -200]}>
      <sphereGeometry args={[1500, 64, 64]} />
      <meshBasicMaterial map={texture} />
      
      {/* Wind effect glow - intensity based on wind */}
      <pointLight
        position={[-1800, 0, -200]}
        intensity={0.5 + windIntensity * 2}
        distance={3000}
        color="#FF8C00"
      />
    </mesh>
  );
};

// Glow
const Glow: React.FC = () => {
  return (
    <mesh position={[-1800, 0, -200]}>
      <sphereGeometry args={[1550, 32, 32]} />
      <meshBasicMaterial 
        color="#FF6600" 
        transparent 
        opacity={0.1} 
        side={THREE.BackSide} 
      />
    </mesh>
  );
};

// Scene content with wind effect
const SceneContent: React.FC<{ windIntensity: number }> = ({ windIntensity }) => {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  
  React.useEffect(() => {
    camera.position.set(0, 0, 800);
    
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = ((e.clientX / window.innerWidth) - 0.5) * 200;
      mouseRef.current.y = ((e.clientY / window.innerHeight) - 0.5) * 100;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [camera]);
  
  useFrame(() => {
    camera.position.x += (mouseRef.current.x - camera.position.x) * 0.02;
    camera.position.y += (-mouseRef.current.y - camera.position.y) * 0.02;
    camera.lookAt(-300, 0, 0);
  });
  
  return (
    <>
      <color attach="background" args={['#080400']} />
      <ambientLight intensity={0.5} />
      <JupiterSphere windIntensity={windIntensity} />
      <Glow />
      <AtmosphereParticles windIntensity={windIntensity} />
    </>
  );
};

// Main component
interface JupiterAtmosphereStormProps {
  isVisible: boolean;
  onScrollToSurface: () => void;
}

const JupiterAtmosphereStorm: React.FC<JupiterAtmosphereStormProps> = ({
  isVisible,
  onScrollToSurface,
}) => {
  // Wind starts automatically at high intensity
  const [windIntensity, setWindIntensity] = useState(1);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY > 50) {
      onScrollToSurface();
    }
  }, [onScrollToSurface]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-40"
      onWheel={handleWheel}
    >
      <Canvas
        camera={{ fov: 75, near: 1, far: 8000, position: [0, 0, 800] }}
        gl={{ antialias: true }}
      >
        <SceneContent windIntensity={windIntensity} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ textShadow: '0 0 20px rgba(255, 140, 0, 0.8)' }}>
            Jupiter's Atmosphere
          </h2>
          <p className="text-orange-300/80 text-sm md:text-base">
            Swirling clouds and storms
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute left-8 top-1/2 -translate-y-1/2 max-w-xs"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30">
            <h3 className="text-orange-400 font-semibold mb-2">Atmosphere Facts</h3>
            <ul className="text-white/80 text-sm space-y-2">
              <li>• Winds reach 620 km/h</li>
              <li>• Storms last hundreds of years</li>
              <li>• Great Red Spot - storm larger than Earth</li>
              <li>• Atmosphere: mainly hydrogen and helium</li>
            </ul>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-orange-300 text-xs mt-3 italic"
            >
              Intense atmospheric wind!
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        >
          <p 
            className="text-white text-base md:text-lg font-semibold mb-2"
            style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 140, 0, 0.5)' }}
          >
            Scroll down to go deeper
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-orange-300"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255, 140, 0, 0.8))' }}
          >
            <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JupiterAtmosphereStorm;
