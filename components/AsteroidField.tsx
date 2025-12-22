import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Asteroid {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  scale: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  orbitTilt: number;
  orbitPhase: number;
  velocity: THREE.Vector3;
  brightness: number;
}

interface AsteroidFieldProps {
  count?: number;
  scrollY?: number;
}

const AsteroidField: React.FC<AsteroidFieldProps> = ({ count = 60, scrollY = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [normalMap, setNormalMap] = useState<THREE.Texture | null>(null);
  
  // Lens flare system
  const lensFlareRefs = useRef<Array<{ sprite: THREE.Sprite; asteroidIndex: number; type: number }>>([]);
  const lensFlareGroupRef = useRef<THREE.Group>(null);
  
  // Trail particles for fast-moving asteroids
  const trailSystemRef = useRef<THREE.Points>(null);
  const trailPositions = useRef<Float32Array>(new Float32Array(count * 10 * 3));
  const trailOpacities = useRef<Float32Array>(new Float32Array(count * 10));

  // Load asteroid texture with enhanced properties
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    loader.load(
      '/Jupiter/textures/immo-wegmann-uvKYxUxaAi4-unsplash.jpg',
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.anisotropy = 16;
        loadedTexture.repeat.set(1, 1);
        setTexture(loadedTexture);
        
        // Create procedural normal map for depth
        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = 512;
        normalCanvas.height = 512;
        const ctx = normalCanvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.createImageData(512, 512);
          for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = 128 + Math.random() * 40 - 20;
            imgData.data[i + 1] = 128 + Math.random() * 40 - 20;
            imgData.data[i + 2] = 200 + Math.random() * 55;
            imgData.data[i + 3] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
          const normal = new THREE.CanvasTexture(normalCanvas);
          normal.wrapS = THREE.RepeatWrapping;
          normal.wrapT = THREE.RepeatWrapping;
          setNormalMap(normal);
        }
      },
      undefined,
      (error) => console.error('Error loading asteroid texture:', error)
    );
  }, []);

  // Create asteroids with enhanced orbital mechanics
  const asteroids = useMemo<Asteroid[]>(() => {
    const temp: Asteroid[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const orbitRadius = 7 + Math.random() * 15;
      const orbitTilt = (Math.random() - 0.5) * Math.PI * 0.5;
      const orbitPhase = Math.random() * Math.PI * 2;
      
      temp.push({
        position: new THREE.Vector3(
          Math.cos(angle) * orbitRadius,
          (Math.random() - 0.5) * 6,
          Math.sin(angle) * orbitRadius
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
        scale: 0.08 + Math.random() * 0.3,
        orbitRadius,
        orbitSpeed: (0.03 + Math.random() * 0.12) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: angle,
        orbitTilt,
        orbitPhase,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.002
        ),
        brightness: 0.3 + Math.random() * 0.7
      });
    }
    
    return temp;
  }, [count]);

  // Enhanced lens flare textures with chromatic aberration
  const createLensFlareTexture = (size: number, color: THREE.Color, alpha: number, type: 'main' | 'ring' | 'hex' | 'ghost') => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return new THREE.CanvasTexture(canvas);
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    if (type === 'main') {
      // Main bright core
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.1, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha * 0.9})`);
      gradient.addColorStop(0.3, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha * 0.6})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    } else if (type === 'ring') {
      // Ring flare
      const gradient = ctx.createRadialGradient(centerX, centerY, size * 0.3, centerX, centerY, size * 0.5);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.4, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha * 0.5})`);
      gradient.addColorStop(0.6, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    } else if (type === 'hex') {
      // Hexagonal aperture flare
      ctx.translate(centerX, centerY);
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * size * 0.3;
        const y = Math.sin(angle) * size * 0.3;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
      gradient.addColorStop(0, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha * 0.6})`);
      gradient.addColorStop(1, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      // Ghost flare
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2);
      gradient.addColorStop(0, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha * 0.4})`);
      gradient.addColorStop(0.5, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    
    return new THREE.CanvasTexture(canvas);
  };

  // Create complex lens flare system
  useEffect(() => {
    if (!lensFlareGroupRef.current) return;
    
    const flareCount = Math.min(20, Math.floor(count / 3));
    const flareTypes: Array<{ type: 'main' | 'ring' | 'hex' | 'ghost'; size: number; color: THREE.Color; alpha: number; scale: number }> = [
      { type: 'main', size: 128, color: new THREE.Color(0xFFFFFF), alpha: 0.9, scale: 0.5 },
      { type: 'ring', size: 96, color: new THREE.Color(0xFFAA44), alpha: 0.7, scale: 0.8 },
      { type: 'hex', size: 64, color: new THREE.Color(0xFF6633), alpha: 0.5, scale: 0.4 },
      { type: 'ghost', size: 48, color: new THREE.Color(0x4488FF), alpha: 0.4, scale: 0.3 },
      { type: 'ghost', size: 32, color: new THREE.Color(0x88FFAA), alpha: 0.3, scale: 0.25 },
    ];
    
    for (let i = 0; i < flareCount; i++) {
      const asteroidIndex = Math.floor((i / flareCount) * count);
      
      flareTypes.forEach((flareConfig, typeIndex) => {
        const flareTexture = createLensFlareTexture(
          flareConfig.size,
          flareConfig.color,
          flareConfig.alpha,
          flareConfig.type
        );
        
        const flareMaterial = new THREE.SpriteMaterial({
          map: flareTexture,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: flareConfig.alpha,
          depthWrite: false,
        });
        
        const flare = new THREE.Sprite(flareMaterial);
        flare.scale.set(flareConfig.scale, flareConfig.scale, 1);
        
        lensFlareGroupRef.current.add(flare);
        lensFlareRefs.current.push({
          sprite: flare,
          asteroidIndex,
          type: typeIndex
        });
      });
    }
  }, [count]);

  // Main animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const camera = state.camera;
    const matrix = new THREE.Matrix4();
    const tempVec = new THREE.Vector3();
    
    if (instancedMeshRef.current && asteroids.length > 0) {
      asteroids.forEach((asteroid, i) => {
        // Complex orbital motion with perturbations
        asteroid.orbitAngle += asteroid.orbitSpeed * 0.01;
        
        // 3D Elliptical orbit with precession
        const a = asteroid.orbitRadius;
        const b = asteroid.orbitRadius * 0.85;
        const c = Math.sqrt(a * a - b * b);
        
        const x = a * Math.cos(asteroid.orbitAngle) + c;
        const z = b * Math.sin(asteroid.orbitAngle);
        
        // Vertical oscillation with orbital resonance
        const y = Math.sin(asteroid.orbitAngle * 2 + asteroid.orbitPhase) * 2.5 +
                 Math.cos(time * 0.5 + asteroid.orbitTilt) * 1.2;
        
        asteroid.position.set(x, y, z);
        
        // Add chaotic drift influenced by "Jupiter's gravity"
        const distToCenter = asteroid.position.length();
        const gravityFactor = 1 / (distToCenter * distToCenter + 1);
        tempVec.copy(asteroid.position).normalize().multiplyScalar(-gravityFactor * 0.001);
        asteroid.position.add(tempVec);
        
        // Micro-drift
        asteroid.position.x += Math.sin(time * 0.8 + i * 0.3) * 0.015;
        asteroid.position.y += Math.cos(time * 0.6 + i * 0.5) * 0.012;
        asteroid.position.z += Math.sin(time * 0.7 + i * 0.7) * 0.013;
        
        // Enhanced parallax
        const parallaxFactor = 0.00025 * (1 + (i / count) * 0.5);
        asteroid.position.y -= scrollY * parallaxFactor;
        asteroid.position.x += Math.sin(scrollY * 0.001 + i) * 0.002;
        
        // Dynamic tumbling rotation
        asteroid.rotation.x += asteroid.rotationSpeed.x * (1 + Math.sin(time + i) * 0.2);
        asteroid.rotation.y += asteroid.rotationSpeed.y * (1 + Math.cos(time + i) * 0.2);
        asteroid.rotation.z += asteroid.rotationSpeed.z * (1 + Math.sin(time * 0.5 + i) * 0.2);
        
        // Apply transformation
        matrix.compose(
          asteroid.position,
          new THREE.Quaternion().setFromEuler(asteroid.rotation),
          new THREE.Vector3(asteroid.scale, asteroid.scale, asteroid.scale)
        );
        
        instancedMeshRef.current!.setMatrixAt(i, matrix);
        
        // Update color based on distance to camera (atmospheric scattering simulation)
        const distanceToCamera = camera.position.distanceTo(asteroid.position);
        const color = new THREE.Color();
        if (distanceToCamera < 15) {
          color.setHSL(0.08, 0.3, 0.4 * asteroid.brightness);
        } else {
          const fade = THREE.MathUtils.clamp((25 - distanceToCamera) / 10, 0, 1);
          color.setHSL(0.08, 0.3 * fade, 0.4 * asteroid.brightness * fade);
        }
        instancedMeshRef.current!.setColorAt(i, color);
      });
      
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
    
    // Update lens flares with advanced positioning
    if (lensFlareGroupRef.current && lensFlareRefs.current.length > 0) {
      const screenCenter = new THREE.Vector2(0, 0);
      
      lensFlareRefs.current.forEach((flareData) => {
        const { sprite, asteroidIndex, type } = flareData;
        
        if (asteroidIndex < asteroids.length) {
          const asteroid = asteroids[asteroidIndex];
          const asteroidPos = asteroid.position.clone();
          
          // Project to screen space
          const screenPos = asteroidPos.clone().project(camera);
          const distanceToCenter = camera.position.distanceTo(asteroidPos);
          
          // Calculate lens flare position along camera-asteroid axis
          const direction = new THREE.Vector3()
            .subVectors(asteroidPos, camera.position)
            .normalize();
          
          // Different types have different offset patterns
          const offsetPatterns = [0, -0.3, -0.6, 0.4, 0.7];
          const offsetFactor = offsetPatterns[type] || 0;
          
          const flarePos = camera.position.clone()
            .add(direction.multiplyScalar(distanceToCenter + offsetFactor * 5));
          
          sprite.position.copy(flarePos);
          
          // Visibility and opacity calculations
          const fadeStart = 12;
          const fadeEnd = 30;
          const distanceFade = THREE.MathUtils.clamp(
            1 - (distanceToCenter - fadeStart) / (fadeEnd - fadeStart),
            0,
            1
          );
          
          // Check if behind camera
          const behindCamera = direction.dot(camera.getWorldDirection(new THREE.Vector3())) < 0;
          
          // Pulsing and flickering
          const pulseFactor = 0.7 + Math.sin(time * 3 + asteroidIndex * 0.8 + type) * 0.3;
          const flickerFactor = 0.9 + Math.random() * 0.1;
          
          // Angular fade (dimmer when viewed from oblique angles)
          const viewAngle = Math.abs(screenPos.x) + Math.abs(screenPos.y);
          const angleFade = THREE.MathUtils.clamp(1 - viewAngle * 0.5, 0.2, 1);
          
          // Brightness based on asteroid brightness
          const brightnessFactor = asteroid.brightness;
          
          if (sprite.material instanceof THREE.SpriteMaterial) {
            sprite.material.opacity = behindCamera ? 0 : 
              distanceFade * pulseFactor * flickerFactor * angleFade * brightnessFactor * 
              (type === 0 ? 0.8 : type === 1 ? 0.6 : 0.4);
          }
          
          // Dynamic scaling
          const baseScale = type === 0 ? 0.5 : (type === 1 ? 0.8 : 0.3 + type * 0.1);
          const scale = baseScale * (1 - distanceToCenter / 40) * (1 + pulseFactor * 0.2);
          sprite.scale.set(Math.max(scale, 0.05), Math.max(scale, 0.05), 1);
          
          // Color shift based on screen position (chromatic aberration)
          if (sprite.material instanceof THREE.SpriteMaterial && type > 0) {
            const hue = 0.05 + type * 0.15 + Math.abs(screenPos.x) * 0.1;
            sprite.material.color.setHSL(hue, 0.7, 0.6);
          }
        }
      });
    }
    
    // Rotate entire field
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.008;
      groupRef.current.position.y = Math.sin(time * 0.15) * 0.4 - scrollY * 0.00025;
    }
  });

  if (!texture) {
    return null;
  }

  // Create varied icosahedron geometries
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const positions = geo.attributes.position;
    
    // Deform vertices for irregular, rocky appearance
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      
      // Add noise
      const noise = 0.7 + Math.random() * 0.6;
      vertex.multiplyScalar(noise);
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Instanced asteroids */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[geometry, undefined, count]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={texture}
          normalMap={normalMap || undefined}
          roughness={0.98}
          metalness={0.05}
          color="#888888"
          emissive="#221100"
          emissiveIntensity={0.03}
          normalScale={new THREE.Vector2(2, 2)}
        />
      </instancedMesh>
      
      {/* Lens flares group */}
      <group ref={lensFlareGroupRef} />
      
      {/* Point lights on brightest asteroids */}
      {asteroids.slice(0, 12).map((asteroid, i) => (
        asteroid.brightness > 0.6 && (
          <pointLight
            key={i}
            position={[asteroid.position.x, asteroid.position.y, asteroid.position.z]}
            intensity={0.4 * asteroid.brightness}
            distance={4}
            color={i % 3 === 0 ? '#FFAA66' : i % 3 === 1 ? '#6688FF' : '#FF8844'}
            decay={2}
          />
        )
      ))}
    </group>
  );
};

export default AsteroidField;

