import React, { useRef, useMemo, useCallback } from 'react';
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

// Simple particles
const Particles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    for (let i = 0; i < 1500; i++) {
      positions.push(
        Math.random() * 1500 - 300,
        Math.random() * 1000 - 500,
        Math.random() * 1000 - 500
      );
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      size: 20,
      map: createCloudTexture(0),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.8,
      color: '#FF8C00',
    });
    
    return { geometry: geo, material: mat };
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// Jupiter sphere with real texture
const JupiterSphere: React.FC = () => {
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

// Scene content
const SceneContent: React.FC = () => {
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
      <JupiterSphere />
      <Glow />
      <Particles />
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
        <SceneContent />
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
            Atmosfera Jowisza
          </h2>
          <p className="text-orange-300/80 text-sm md:text-base">
            Wirujące chmury i burze
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute left-8 top-1/2 -translate-y-1/2 max-w-xs"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30">
            <h3 className="text-orange-400 font-semibold mb-2">Fakty o atmosferze</h3>
            <ul className="text-white/80 text-sm space-y-2">
              <li>• Wiatry osiągają 620 km/h</li>
              <li>• Burze trwają setki lat</li>
              <li>• Wielka Czerwona Plama - burza większa od Ziemi</li>
              <li>• Atmosfera: głównie wodór i hel</li>
            </ul>
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
            Przewiń w dół aby zejść głębiej
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
