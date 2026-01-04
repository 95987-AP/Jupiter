import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';

// ============================================
// IMPROVED NOISE IMPLEMENTATION
// ============================================
class ImprovedNoise {
  private p: number[];

  constructor() {
    const permutation = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
      247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
      57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
      60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
      65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
      200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
      52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
      207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
      119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
      218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];
    
    this.p = new Array(512);
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i] = permutation[i];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number): number {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);
    const floorZ = Math.floor(z);

    const X = floorX & 255;
    const Y = floorY & 255;
    const Z = floorZ & 255;

    x -= floorX;
    y -= floorY;
    z -= floorZ;

    const xMinus1 = x - 1;
    const yMinus1 = y - 1;
    const zMinus1 = z - 1;

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], xMinus1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, yMinus1, z), this.grad(this.p[BB], xMinus1, yMinus1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, zMinus1), this.grad(this.p[BA + 1], xMinus1, y, zMinus1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, yMinus1, zMinus1), this.grad(this.p[BB + 1], xMinus1, yMinus1, zMinus1))
      )
    );
  }
}

// ============================================
// TERRAIN GENERATION
// ============================================
function generateHeight(width: number, depth: number): Float32Array {
  const size = width * depth;
  const data = new Float32Array(size);
  const perlin = new ImprovedNoise();
  
  let quality = 1;
  const z = Math.random() * 100;

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width;
      const y = ~~(i / width);
      data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
    }
    quality *= 5;
  }

  return data;
}

function generateTexture(data: Float32Array, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d')!;
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const imageData = image.data;

  const vector3 = new THREE.Vector3(0, 0, 0);
  const sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    const shade = vector3.dot(sun);

    // Jupiter surface colors - oranges, browns, reds
    const baseR = 180 + Math.random() * 40;
    const baseG = 80 + Math.random() * 30;
    const baseB = 20 + Math.random() * 20;

    imageData[i] = Math.min(255, (baseR + shade * 80) * (0.6 + data[j] * 0.008));
    imageData[i + 1] = Math.min(255, (baseG + shade * 40) * (0.5 + data[j] * 0.006));
    imageData[i + 2] = Math.min(255, (baseB + shade * 20) * (0.4 + data[j] * 0.004));
  }

  context.putImageData(image, 0, 0);

  // Scale up for better quality
  const canvasScaled = document.createElement('canvas');
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  const contextScaled = canvasScaled.getContext('2d')!;
  contextScaled.scale(4, 4);
  contextScaled.drawImage(canvas, 0, 0);

  const imageScaled = contextScaled.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  const imageDataScaled = imageScaled.data;

  // Add noise for texture
  for (let i = 0, l = imageDataScaled.length; i < l; i += 4) {
    const v = ~~(Math.random() * 8);
    imageDataScaled[i] += v;
    imageDataScaled[i + 1] += v * 0.5;
    imageDataScaled[i + 2] += v * 0.3;
  }

  contextScaled.putImageData(imageScaled, 0, 0);

  return canvasScaled;
}

// ============================================
// TERRAIN MESH COMPONENT
// ============================================
const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  
  const worldWidth = 512;
  const worldDepth = 512;

  const { geometry, heightData } = useMemo(() => {
    const data = generateHeight(worldWidth, worldDepth);
    const geo = new THREE.PlaneGeometry(15000, 15000, worldWidth - 1, worldDepth - 1);
    geo.rotateX(-Math.PI / 2);

    const vertices = geo.attributes.position.array as Float32Array;
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      vertices[j + 1] = data[i] * 10;
    }
    
    geo.computeVertexNormals();

    return { geometry: geo, heightData: data };
  }, []);

  useEffect(() => {
    const canvas = generateTexture(heightData, worldWidth, worldDepth);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    setTexture(tex);
  }, [heightData]);

  if (!texture) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

// ============================================
// FLOATING PARTICLES IN ATMOSPHERE
// ============================================
const AtmosphericParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 1000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5000;
      pos[i * 3 + 1] = Math.random() * 500 + 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5000;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        // Gentle floating motion
        positions[i * 3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.2;
        positions[i * 3] += Math.cos(time * 0.3 + i * 0.05) * 0.1;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={8}
        color="#FF8C42"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ============================================
// CAMERA CONTROLLER WITH MOUSE CONTROL
// ============================================
const CameraController = () => {
  const { camera, gl } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 1000, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 800, 0));
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const pitchRef = useRef(0); // Vertical rotation
  const yawRef = useRef(0); // Horizontal rotation
  const velocityRef = useRef(new THREE.Vector3());
  const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false, shift: false });
  const timeRef = useRef(0);
  
  const terrainSize = 15000;
  const minHeight = 600;
  const maxHeight = 2000;
  const moveSpeed = 800;
  const lookSpeed = 0.002;
  const autoMoveSpeed = 30; // Slow automatic movement speed

  useEffect(() => {
    camera.position.set(0, 1000, 0);
    camera.lookAt(0, 800, 500);
    pitchRef.current = -0.3;
    yawRef.current = 0;
  }, [camera]);

  // Handle mouse movement for looking around
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - previousMouseRef.current.x;
        const deltaY = e.clientY - previousMouseRef.current.y;
        
        yawRef.current -= deltaX * lookSpeed;
        pitchRef.current -= deltaY * lookSpeed;
        
        // Clamp pitch to prevent looking too far up or down
        pitchRef.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitchRef.current));
        
        previousMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        isDragging.current = true;
        previousMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Handle keyboard input for movement
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key as keyof typeof keysRef.current] = true;
      }
      if (e.code === 'Space') keysRef.current.space = true;
      if (e.key === 'Shift') keysRef.current.shift = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keysRef.current) {
        keysRef.current[key as keyof typeof keysRef.current] = false;
      }
      if (e.code === 'Space') keysRef.current.space = false;
      if (e.key === 'Shift') keysRef.current.shift = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Calculate movement direction based on yaw
    const forward = new THREE.Vector3(
      Math.sin(yawRef.current),
      0,
      Math.cos(yawRef.current)
    );
    const right = new THREE.Vector3(
      Math.cos(yawRef.current),
      0,
      -Math.sin(yawRef.current)
    );

    // Apply keyboard input to velocity
    const acceleration = 50;
    const friction = 0.92;

    if (keysRef.current.w) {
      velocityRef.current.add(forward.multiplyScalar(acceleration * delta));
    }
    if (keysRef.current.s) {
      velocityRef.current.add(forward.multiplyScalar(-acceleration * delta));
    }
    if (keysRef.current.a) {
      velocityRef.current.add(right.multiplyScalar(-acceleration * delta));
    }
    if (keysRef.current.d) {
      velocityRef.current.add(right.multiplyScalar(acceleration * delta));
    }
    if (keysRef.current.space) {
      velocityRef.current.y += acceleration * delta;
    }
    if (keysRef.current.shift) {
      velocityRef.current.y -= acceleration * delta;
    }

    // Apply friction
    velocityRef.current.multiplyScalar(friction);

    // Add slow automatic movement if user isn't moving
    const isUserMoving = keysRef.current.w || keysRef.current.a || keysRef.current.s || keysRef.current.d;
    if (!isUserMoving && velocityRef.current.length() < 1) {
      // Slow automatic forward movement
      const autoMove = forward.clone().multiplyScalar(autoMoveSpeed * delta);
      velocityRef.current.add(autoMove);
      
      // Subtle automatic camera sway
      const swayAmount = 0.3;
      targetPos.current.x += Math.sin(timeRef.current * 0.2) * swayAmount * delta;
      targetPos.current.z += Math.cos(timeRef.current * 0.15) * swayAmount * delta;
    }

    // Update position
    targetPos.current.add(velocityRef.current);

    // Clamp position to terrain bounds
    const halfSize = terrainSize / 2;
    targetPos.current.x = Math.max(-halfSize, Math.min(halfSize, targetPos.current.x));
    targetPos.current.z = Math.max(-halfSize, Math.min(halfSize, targetPos.current.z));
    targetPos.current.y = Math.max(minHeight, Math.min(maxHeight, targetPos.current.y));

    // Smooth camera movement
    camera.position.lerp(targetPos.current, 0.1);

    // Calculate look-at position based on pitch and yaw
    const lookDirection = new THREE.Vector3(
      Math.sin(yawRef.current) * Math.cos(pitchRef.current),
      Math.sin(pitchRef.current),
      Math.cos(yawRef.current) * Math.cos(pitchRef.current)
    );
    
    targetLookAt.current.copy(camera.position).add(lookDirection);
    camera.lookAt(targetLookAt.current);
  });

  return null;
};

// ============================================
// MAIN SURFACE VIEW WITH 3D TERRAIN
// ============================================
interface JupiterSurfaceTerrainProps {
  isVisible: boolean;
  onReturnToOrbit: () => void;
}

const JupiterSurfaceTerrain: React.FC<JupiterSurfaceTerrainProps> = ({
  isVisible,
  onReturnToOrbit,
}) => {
  const [isRocketHovered, setIsRocketHovered] = useState(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <Canvas
              camera={{ fov: 75, near: 1, far: 30000 }}
              gl={{ antialias: true }}
              dpr={[1, 1.5]}
            >
              {/* Jupiter-like foggy atmosphere */}
              <color attach="background" args={['#2a1810']} />
              <fogExp2 attach="fog" args={['#3d2817', 0.00015]} />
              
              {/* Ambient lighting */}
              <ambientLight intensity={0.4} color="#FFE4C4" />
              
              {/* Sun-like directional light */}
              <directionalLight
                position={[1000, 1000, 500]}
                intensity={1.5}
                color="#FFA54F"
              />
              
              {/* Subtle fill light */}
              <pointLight
                position={[-500, 200, -500]}
                intensity={0.5}
                color="#FF6B35"
              />

              <CameraController />
              <Terrain />
              <AtmosphericParticles />
            </Canvas>
          </div>

          {/* Heat haze overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-orange-900/30 via-transparent to-orange-950/20"
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          {/* Content overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Text content */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center pointer-events-none"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-wider"
              style={{ textShadow: '0 0 40px rgba(255,100,0,0.6)' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              JUPITER'S DEPTHS
            </motion.h1>
            
            <motion.div
              className="max-w-3xl space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <p className="text-xl md:text-2xl text-orange-100 leading-relaxed">
                You reach a place where <span className="text-red-400 font-semibold">pressure</span> is
                millions of times greater than on Earth, and hydrogen becomes
                <span className="text-cyan-300 font-semibold">metallic</span>.
              </p>
              
              <p className="text-lg text-orange-200/80 leading-relaxed">
                Beneath the clouds lies an ocean of <span className="text-blue-300">liquid hydrogen</span> -
                the largest in the Solar System. Temperature rises to
                <span className="text-yellow-400"> 20,000°C</span> in the core, where there is likely a rocky center
                <span className="text-purple-300">20 times</span> more massive than Earth.
              </p>
              
              <p className="text-base text-orange-300/70 mt-6 italic">
                "If Jupiter were 80 times more massive, it would become a star."
              </p>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30 max-w-md mx-auto mt-6">
                <h3 className="text-orange-400 font-semibold mb-2">Controls</h3>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• <span className="text-orange-300">WASD</span> - Move around</li>
                  <li>• <span className="text-orange-300">Space/Shift</span> - Up/Down</li>
                  <li>• <span className="text-orange-300">Left Click + Drag</span> - Look around</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* Return to Orbit Button */}
          <motion.button
            className="fixed bottom-8 right-8 z-20 group pointer-events-auto"
            onClick={onReturnToOrbit}
            onMouseEnter={() => setIsRocketHovered(true)}
            onMouseLeave={() => setIsRocketHovered(false)}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-4 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300">
              {/* Rocket icon with animation */}
              <motion.div
                className="relative"
                animate={isRocketHovered ? {
                  y: [-2, -8, -20],
                  x: [0, 2, 5],
                  rotate: [-10, -25, -45],
                  scale: [1, 1.1, 0.8],
                } : {
                  y: 0,
                  x: 0,
                  rotate: 0,
                  scale: 1,
                }}
                transition={{ 
                  duration: isRocketHovered ? 0.6 : 0.3,
                  ease: isRocketHovered ? "easeOut" : "easeIn",
                }}
              >
                <Rocket className="w-6 h-6" />
                
                {/* Rocket flame on hover */}
                <AnimatePresence>
                  {isRocketHovered && (
                    <motion.div
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                    >
                      <motion.div
                        className="w-3 h-6 bg-gradient-to-t from-yellow-400 via-orange-500 to-transparent rounded-full blur-sm"
                        animate={{
                          scaleY: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <span className="font-semibold tracking-wide">Return to Orbit</span>
              
              {/* Animated particles on hover */}
              <AnimatePresence>
                {isRocketHovered && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-orange-300 rounded-full"
                        style={{
                          left: '20px',
                          top: '50%',
                        }}
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: [-10, -30 - Math.random() * 20],
                          y: [0, (Math.random() - 0.5) * 30],
                        }}
                        transition={{
                          duration: 0.5,
                          delay: i * 0.05,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
            
            {/* Pulsing ring animation */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-orange-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JupiterSurfaceTerrain;
