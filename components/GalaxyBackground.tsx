import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Stars, Float, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import AsteroidField from './AsteroidField';
import DebrisField from './DebrisField';
import OrbitingMoons from './OrbitingMoons';

// ============================================
// CUSTOM SHADERS FOR GALACTIC EFFECTS
// ============================================

// Nebula Shader Material
const NebulaShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uScrollY: 0,
    uColor1: new THREE.Color('#FF6B35'),
    uColor2: new THREE.Color('#9D4EDD'),
    uColor3: new THREE.Color('#1E3A5F'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uScrollY;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      vec3 pos = position;
      pos.z += sin(pos.x * 2.0 + uTime * 0.5) * 0.3;
      pos.z += cos(pos.y * 2.0 + uTime * 0.3) * 0.3;
      pos.y += uScrollY * 0.0001;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Multi-layered noise for nebula effect
      float noise1 = snoise(vec3(uv * 3.0, uTime * 0.1));
      float noise2 = snoise(vec3(uv * 6.0, uTime * 0.15));
      float noise3 = snoise(vec3(uv * 12.0, uTime * 0.2));
      
      float finalNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Color mixing based on noise
      vec3 color = mix(uColor1, uColor2, smoothstep(-0.5, 0.5, finalNoise));
      color = mix(color, uColor3, smoothstep(0.2, 0.8, noise2));
      
      // Radial fade
      float dist = length(uv - 0.5) * 2.0;
      float alpha = smoothstep(1.0, 0.3, dist) * (0.3 + finalNoise * 0.3);
      
      gl_FragColor = vec4(color, alpha * 0.4);
    }
  `
);

extend({ NebulaShaderMaterial });

// ============================================
// SHOOTING STARS EFFECT
// ============================================
const ShootingStars = ({ count = 15, scrollY = 0 }) => {
  const starsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>(new Float32Array(count * 3));
  const lifetimesRef = useRef<Float32Array>(new Float32Array(count));
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;
    
    for (let i = 0; i < count; i++) {
      // Random starting positions around the scene
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50 + 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      // Velocity - diagonal movement
      velocities[i * 3] = (Math.random() - 0.3) * 0.8;
      velocities[i * 3 + 1] = -Math.random() * 0.5 - 0.3;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      
      // Random lifetime offset
      lifetimes[i] = Math.random() * Math.PI * 2;
      
      // White/blue color
      colors[i * 3] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.95 + Math.random() * 0.05;
      colors[i * 3 + 2] = 1.0;
    }
    
    return { positions, colors };
  }, [count]);
  
  useFrame((state) => {
    if (!starsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsArray = starsRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;
    
    for (let i = 0; i < count; i++) {
      // Update positions
      positionsArray[i * 3] += velocities[i * 3];
      positionsArray[i * 3 + 1] += velocities[i * 3 + 1];
      positionsArray[i * 3 + 2] += velocities[i * 3 + 2];
      
      // Reset when out of bounds
      if (positionsArray[i * 3 + 1] < -30 || Math.abs(positionsArray[i * 3]) > 60) {
        positionsArray[i * 3] = (Math.random() - 0.5) * 100;
        positionsArray[i * 3 + 1] = Math.random() * 30 + 30;
        positionsArray[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }
    
    starsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Parallax effect
    starsRef.current.position.y = scrollY * 0.001;
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ============================================
// COSMIC DUST / PARTICLE CLOUD
// ============================================
const CosmicDust = ({ count = 3000, scrollY = 0 }) => {
  const dustRef = useRef<THREE.Points>(null);
  const initialPositions = useRef<Float32Array | null>(null);
  
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution around Jupiter
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 5 + Math.random() * 15;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Color gradient - golden dust
      const t = Math.random();
      colors[i * 3] = 1.0 * t + 0.8 * (1 - t);
      colors[i * 3 + 1] = 0.7 * t + 0.5 * (1 - t);
      colors[i * 3 + 2] = 0.3 * t + 0.2 * (1 - t);
      
      sizes[i] = Math.random() * 0.05 + 0.02;
    }
    
    initialPositions.current = positions.slice();
    return { positions, colors, sizes };
  }, [count]);
  
  useFrame((state) => {
    if (!dustRef.current || !initialPositions.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsArray = dustRef.current.geometry.attributes.position.array as Float32Array;
    const initial = initialPositions.current;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Orbital motion around Jupiter
      const angle = time * 0.1 + i * 0.01;
      const radius = Math.sqrt(initial[i3] ** 2 + initial[i3 + 2] ** 2);
      
      positionsArray[i3] = Math.cos(angle) * initial[i3] - Math.sin(angle) * initial[i3 + 2];
      positionsArray[i3 + 1] = initial[i3 + 1] + Math.sin(time * 0.5 + i) * 0.2;
      positionsArray[i3 + 2] = Math.sin(angle) * initial[i3] + Math.cos(angle) * initial[i3 + 2];
    }
    
    dustRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Parallax
    dustRef.current.position.y = -scrollY * 0.0003;
    dustRef.current.rotation.y = scrollY * 0.0001;
  });
  
  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ============================================
// NEBULA CLOUD EFFECT
// ============================================
const NebulaCloud = ({ scrollY = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime();
      materialRef.current.uScrollY = scrollY;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.02;
      meshRef.current.position.y = -5 + scrollY * 0.002;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, -5, -20]} rotation={[-Math.PI / 4, 0, 0]}>
      <planeGeometry args={[80, 80, 64, 64]} />
      {/* @ts-ignore */}
      <nebulaShaderMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// ============================================
// GRAVITATIONAL LENSING EFFECT (Ring around Jupiter)
// ============================================
const GravitationalLensing = ({ scrollY = 0 }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ringRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Pulsating effect
    const scale = 1 + Math.sin(time * 2) * 0.05;
    ringRef.current.scale.set(scale, scale, 1);
    
    // Rotation animation
    ringRef.current.rotation.z = time * 0.1;
    
    // SYNC POSITION WITH JUPITER - match the Float movement
    // Jupiter's position: y = Math.sin(time * 0.5) * 0.3 - scrollY * 0.0005
    const jupiterY = Math.sin(time * 0.5) * 0.3 - scrollY * 0.0005;
    const jupiterX = Math.cos(time * 0.3) * 0.2;
    ringRef.current.position.y = jupiterY;
    ringRef.current.position.x = jupiterX;
    
    // Opacity based on scroll
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollProgress = Math.min(scrollY / maxScroll, 1);
    
    if (ringRef.current.material instanceof THREE.ShaderMaterial) {
      ringRef.current.material.uniforms.uOpacity.value = 0.3 + scrollProgress * 0.3;
    }
  });
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.3 },
        uColor: { value: new THREE.Color('#FFA726') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = length(vUv - center);
          
          // Ring shape
          float ring = smoothstep(0.35, 0.4, dist) * smoothstep(0.5, 0.45, dist);
          
          // Animated glow
          float glow = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;
          
          vec3 color = uColor * (1.0 + glow * 0.5);
          float alpha = ring * uOpacity * (0.5 + glow * 0.5);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);
  
  useFrame((state) => {
    shaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
  });
  
  // Jupiter's rings are tilted ~3 degrees relative to Jupiter's equatorial plane
  // rotation: [Math.PI / 2 (horizontal), 0, 0] = flat horizontal ring
  // Adding slight tilt: x rotation of ~0.05 radians (~3 degrees)
  return (
    <mesh ref={ringRef} position={[0, 0, 0.1]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
      <ringGeometry args={[3.5, 4.5, 64]} />
      <primitive object={shaderMaterial} />
    </mesh>
  );
};

// ============================================
// AURORA EFFECT ON JUPITER
// ============================================
const JupiterAurora = ({ scrollY = 0 }) => {
  const auroraRef = useRef<THREE.Mesh>(null);
  
  const auroraMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#00ff88') },
        uColor2: { value: new THREE.Color('#ff00ff') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float uTime;
        
        void main() {
          vUv = uv;
          vNormal = normal;
          
          vec3 pos = position;
          pos += normal * sin(uv.x * 10.0 + uTime * 2.0) * 0.05;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // Aurora bands
          float bands = sin(vUv.x * 30.0 + uTime * 3.0) * 0.5 + 0.5;
          bands *= sin(vUv.y * 5.0 - uTime) * 0.5 + 0.5;
          
          // Only visible at poles
          float poleFactor = pow(abs(vUv.y - 0.5) * 2.0, 3.0);
          
          vec3 color = mix(uColor1, uColor2, bands);
          float alpha = bands * poleFactor * 0.4;
          
          // Fresnel effect
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          alpha *= fresnel;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);
  
  useFrame((state) => {
    auroraMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    
    if (auroraRef.current) {
      auroraRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });
  
  return (
    <mesh ref={auroraRef}>
      <sphereGeometry args={[3.0, 64, 64]} />
      <primitive object={auroraMaterial} />
    </mesh>
  );
};

// ============================================
// ENHANCED GALAXY PARTICLES WITH SHADER
// ============================================
const GalaxyParticles = ({ count = 50000, scrollY = 0 }) => {
  const mesh = useRef<THREE.Points>(null);
  
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    const colorInside = new THREE.Color('#FF6B35');
    const colorOutside = new THREE.Color('#1E3A5F');
    const colorPurple = new THREE.Color('#9D4EDD');
    const colorCyan = new THREE.Color('#00D4FF');

    for (let i = 0; i < count; i++) {
      // Enhanced spiral with multiple arms
      const radius = Math.random() * 30;
      const spinAngle = radius * 1.2;
      const branchAngle = ((i % 6) / 6) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4 * radius;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4 * radius;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.4 * radius;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i * 3 + 1] = randomY * 0.15;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Enhanced color mixing with cyan accents
      const mixedColor = colorInside.clone()
        .lerp(colorPurple, Math.random() * 0.4)
        .lerp(colorCyan, Math.random() * 0.2)
        .lerp(colorOutside, radius / 30);
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
      
      scales[i] = Math.random();
    }
    return { positions, colors, scales };
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.getElapsedTime();
      
      // Smooth rotation with easing
      mesh.current.rotation.y = time * 0.03 + Math.sin(time * 0.1) * 0.02;
      mesh.current.rotation.x = Math.sin(time * 0.05) * 0.08;
      
      // Enhanced parallax with depth
      const scrollFactor = scrollY * 0.0004;
      mesh.current.position.y = scrollFactor;
      mesh.current.position.z = -scrollFactor * 0.5;
      mesh.current.rotation.z = scrollY * 0.00003;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
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
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
        transparent
        opacity={0.85}
      />
    </points>
  );
};

// Advanced Jupiter Sphere with Real Texture and Atmospheric Effects
const Jupiter = ({ scrollY = 0 }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const mouseRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const manualRotation = useRef({ x: 0, y: 0 });

  console.log('Jupiter: Component mounting, scrollY:', scrollY);

  // Load Jupiter texture
  useEffect(() => {
    console.log('Jupiter: Starting texture load...');
    const loader = new THREE.TextureLoader();
    loader.load(
      '/Jupiter/textures/8k_jupiter.jpg',
      (loadedTexture) => {
        console.log('Jupiter: Texture loaded successfully!');
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.anisotropy = 16;
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        setTexture(loadedTexture);
      },
      (progress) => {
        console.log('Jupiter: Loading progress:', (progress.loaded / progress.total * 100).toFixed(0) + '%');
      },
      (error) => {
        console.error('Jupiter: Error loading texture:', error);
      }
    );
  }, []);

  useFrame((state) => {
      const time = state.clock.getElapsedTime();
      
      // Calculate scroll progress for zoom effect
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      
      // Apply damping to rotation velocity
      if (!mouseRef.current.isDragging) {
        rotationVelocity.current.x *= 0.95;
        rotationVelocity.current.y *= 0.95;
        manualRotation.current.x += rotationVelocity.current.x;
        manualRotation.current.y += rotationVelocity.current.y;
      }
      
      if (mesh.current) {
          // Combine automatic and manual rotation
          const autoRotation = time * 0.12;
          mesh.current.rotation.y = autoRotation + manualRotation.current.y;
          mesh.current.rotation.x = Math.sin(time * 0.3) * 0.015 + manualRotation.current.x;
          mesh.current.rotation.z = Math.cos(time * 0.4) * 0.015;
      }
      
      if (groupRef.current) {
          // Floating movement with parallax
          groupRef.current.position.y = Math.sin(time * 0.5) * 0.3 - scrollY * 0.0005;
          groupRef.current.position.x = Math.cos(time * 0.3) * 0.2;
          
          // Scale effect - Jupiter appears larger as camera zooms in
          const scaleValue = THREE.MathUtils.lerp(1, 1.5, scrollProgress);
          groupRef.current.scale.setScalar(scaleValue);
      }
      
      if (atmosphereRef.current) {
          // Counter-rotate atmosphere for dynamic effect
          atmosphereRef.current.rotation.y = -time * 0.05;
          
          // Atmosphere becomes more visible as we get closer
          const baseOpacity = 0.15 + Math.sin(time) * 0.05;
          if (atmosphereRef.current.material instanceof THREE.MeshBasicMaterial) {
            atmosphereRef.current.material.opacity = baseOpacity * (1 + scrollProgress * 0.3);
          }
      }
      
      if (lightRef.current) {
          // Pulsing glow effect - stronger when closer
          const baseIntensity = 2.5 + Math.sin(time * 2) * 0.5;
          lightRef.current.intensity = baseIntensity * (1 + scrollProgress * 0.4);
      }
  });

  if (!texture) {
    // Loading placeholder
    return (
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
        <mesh>
          <sphereGeometry args={[2.8, 64, 64]} />
          <meshStandardMaterial 
            color="#C88B3A"
            roughness={0.9}
            metalness={0.1}
            emissive="#C88B3A"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>
    );
  }

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={groupRef}>
        {/* Main Jupiter sphere */}
        <mesh 
          ref={mesh} 
          castShadow
          onPointerDown={(e) => {
            e.stopPropagation();
            mouseRef.current.isDragging = true;
            mouseRef.current.lastX = e.clientX;
            mouseRef.current.lastY = e.clientY;
          }}
          onPointerMove={(e) => {
            if (mouseRef.current.isDragging) {
              e.stopPropagation();
              const deltaX = e.clientX - mouseRef.current.lastX;
              const deltaY = e.clientY - mouseRef.current.lastY;
              
              // Update velocity for momentum
              rotationVelocity.current.y = deltaX * 0.01;
              rotationVelocity.current.x = deltaY * 0.01;
              
              // Apply rotation directly
              manualRotation.current.y += deltaX * 0.01;
              manualRotation.current.x += deltaY * 0.01;
              
              mouseRef.current.lastX = e.clientX;
              mouseRef.current.lastY = e.clientY;
            }
          }}
          onPointerUp={() => {
            mouseRef.current.isDragging = false;
          }}
          onPointerLeave={() => {
            mouseRef.current.isDragging = false;
          }}
        >
          <sphereGeometry args={[2.8, 128, 128]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.85}
            metalness={0.05}
            emissive="#C88B3A"
            emissiveIntensity={0.12}
          />
        </mesh>
        
        {/* Atmospheric glow layer */}
        <mesh ref={atmosphereRef} scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[2.8, 64, 64]} />
          <meshBasicMaterial 
            color="#FFB84D"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Inner glow */}
        <mesh scale={[1.02, 1.02, 1.02]}>
          <sphereGeometry args={[2.8, 64, 64]} />
          <meshBasicMaterial 
            color="#FF8C42"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Point light at center for volumetric glow */}
        <pointLight 
          ref={lightRef} 
          position={[0, 0, 0]} 
          intensity={2.5} 
          color="#FFA726" 
          distance={20} 
          decay={2} 
        />
        
        {/* Rim light to enhance edges */}
        <pointLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          color="#FFE082" 
          distance={15} 
        />
      </group>
    </Float>
  );
};

// Milky Way Skybox - distant background with stars texture
const MilkyWaySkybox = ({ scrollY = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/Jupiter/textures/2k_stars_milky_way.jpg',
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => console.error('Failed to load Milky Way texture:', error)
    );
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Very slow rotation for realistic sky movement
      meshRef.current.rotation.y = time * 0.002 + scrollY * 0.00001;
      meshRef.current.rotation.x = Math.sin(time * 0.01) * 0.02;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </mesh>
  );
};

// Animated stars with depth layers and enhanced parallax
const AnimatedStars = ({ scrollY = 0 }) => {
  const group = useRef<THREE.Group>(null);
  const innerStarsRef = useRef<THREE.Group>(null);
  const outerStarsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (group.current) {
      // Base rotation
      group.current.rotation.y = time * 0.008 + scrollY * 0.00002;
      group.current.rotation.x = Math.sin(time * 0.03) * 0.03;
    }
    
    // Different parallax speeds for depth effect
    if (innerStarsRef.current) {
      innerStarsRef.current.position.y = -scrollY * 0.0008;
      innerStarsRef.current.rotation.z = time * 0.005;
    }
    
    if (outerStarsRef.current) {
      outerStarsRef.current.position.y = -scrollY * 0.0003;
      outerStarsRef.current.rotation.z = -time * 0.002;
    }
  });
  
  return (
    <group ref={group}>
      <group ref={innerStarsRef}>
        <Stars radius={80} depth={60} count={6000} factor={4} saturation={0.3} fade speed={1.5} />
      </group>
      <group ref={outerStarsRef}>
        <Stars radius={180} depth={100} count={4000} factor={7} saturation={0.1} fade speed={0.3} />
      </group>
    </group>
  );
};

// Dynamic fog controller
const DynamicFog = ({ scrollY = 0 }) => {
  const { scene } = useThree();
  
  useFrame(() => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      // Adjust fog based on zoom - closer = less fog for clarity
      scene.fog.near = THREE.MathUtils.lerp(15, 5, scrollProgress);
      scene.fog.far = THREE.MathUtils.lerp(50, 30, scrollProgress);
    }
  });
  
  return null;
};

// Camera controller - Jupiter orbit and moon POV orbital movement
const CameraController = ({ scrollY = 0 }: { scrollY?: number }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 5, 12));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Calculate scroll progress (0 to 1 across page)
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    
    // Smooth easing functions
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    // Phase 1: 0-35% - Approach and orbit Jupiter
    // Phase 2: 35-100% - Pull back and orbit along moon's path (POV from moon)
    const jupiterPhase = 0.35;
    
    let finalPosition: THREE.Vector3;
    let finalLookAt: THREE.Vector3;
    let finalFOV: number;
    
    if (scrollProgress < jupiterPhase) {
      // Phase 1: Approach Jupiter, then orbit around it
      const phaseProgress = scrollProgress / jupiterPhase;
      const easedProgress = easeOutCubic(phaseProgress);
      
      // First half: approach. Second half: orbit
      if (phaseProgress < 0.4) {
        // Approach Jupiter
        const approachProgress = phaseProgress / 0.4;
        const zoomFactor = THREE.MathUtils.lerp(12, 5, easeOutCubic(approachProgress));
        
        finalPosition = new THREE.Vector3(
          0,
          THREE.MathUtils.lerp(5, 2, approachProgress),
          zoomFactor
        );
        finalFOV = THREE.MathUtils.lerp(48, 42, approachProgress);
      } else {
        // Orbit around Jupiter
        const orbitProgress = (phaseProgress - 0.4) / 0.6;
        const angle = orbitProgress * Math.PI * 1.5; // 270 degrees orbit
        const radius = THREE.MathUtils.lerp(5, 4, orbitProgress);
        const height = THREE.MathUtils.lerp(2, 0.5, orbitProgress);
        
        finalPosition = new THREE.Vector3(
          Math.sin(angle) * radius,
          height + Math.sin(orbitProgress * Math.PI) * 1.5,
          Math.cos(angle) * radius
        );
        finalFOV = THREE.MathUtils.lerp(42, 50, orbitProgress);
      }
      
      finalLookAt = new THREE.Vector3(0, 0, 0);
      
    } else {
      // Phase 2: Moon section - orbit along Jupiter's moon path (POV)
      const moonPhaseProgress = (scrollProgress - jupiterPhase) / (1 - jupiterPhase);
      const easedMoonProgress = easeInOutQuad(moonPhaseProgress);
      
      // Orbital path around Jupiter as if we're a moon
      // Start from close orbit, gradually move outward
      const orbitRadius = THREE.MathUtils.lerp(6, 18, easedMoonProgress);
      const orbitAngle = easedMoonProgress * Math.PI * 2.5 + Math.PI; // 2.5 full orbits
      
      // Subtle vertical bobbing
      const heightVariation = Math.sin(easedMoonProgress * Math.PI * 4) * 0.8;
      
      // Camera positioned on orbital path, looking at Jupiter
      finalPosition = new THREE.Vector3(
        Math.cos(orbitAngle) * orbitRadius,
        1.5 + heightVariation,
        Math.sin(orbitAngle) * orbitRadius
      );
      
      // Always look at Jupiter (center)
      finalLookAt = new THREE.Vector3(0, 0, 0);
      
      // Wider FOV as we get further
      finalFOV = THREE.MathUtils.lerp(50, 38, easedMoonProgress);
    }
    
    // Smooth camera interpolation
    targetPosition.current.lerp(finalPosition, 0.04);
    targetLookAt.current.lerp(finalLookAt, 0.04);
    
    camera.position.copy(targetPosition.current);
    camera.lookAt(targetLookAt.current);
    
    // Smooth FOV changes
    if ('fov' in camera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, finalFOV, 0.03);
      camera.updateProjectionMatrix();
    }
  });
  
  return null;
};

// Main Canvas Component
const GalaxyBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  console.log('GalaxyBackground: Component mounting...');

  useEffect(() => {
    console.log('GalaxyBackground: Setting up scroll listener');
    
    // Smooth scroll handling with requestAnimationFrame and throttling
    let ticking = false;
    let currentScrollY = 0;
    let smoothedScrollY = scrollY;
    
    const handleScroll = () => {
      currentScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Smooth interpolation to prevent jumps
          smoothedScrollY += (currentScrollY - smoothedScrollY) * 0.15;
          setScrollY(smoothedScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  console.log('GalaxyBackground: Rendering canvas, scrollY:', scrollY);

  return (
    <div className="fixed inset-0 z-0 bg-[#0B1929]">
      <Canvas 
        camera={{ position: [0, 5, 12], fov: 48 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        style={{ cursor: 'grab' }}
        onPointerDown={(e) => {
          if (e.target instanceof HTMLCanvasElement) {
            e.target.style.cursor = 'grabbing';
          }
        }}
        onPointerUp={(e) => {
          if (e.target instanceof HTMLCanvasElement) {
            e.target.style.cursor = 'grab';
          }
        }}
      >
        <fog attach="fog" args={['#0B1929', 12, 55]} />
        
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[10, 10, 8]} intensity={2.8} color="#FFF8E7" castShadow />
        <directionalLight position={[-8, 5, 5]} intensity={1.4} color="#FFE082" />
        <pointLight position={[-10, -10, -5]} intensity={2.0} color="#9D4EDD" />
        <pointLight position={[15, 0, -10]} intensity={1.2} color="#00D4FF" />
        <hemisphereLight intensity={0.6} groundColor="#1a1a2e" color="#FFA726" />
        
        <DynamicFog scrollY={scrollY} />
        <CameraController scrollY={scrollY} />
        
        {/* Milky Way background - furthest layer */}
        <MilkyWaySkybox scrollY={scrollY} />
        
        {/* Jupiter with new effects */}
        <Jupiter scrollY={scrollY} />
        <JupiterAurora scrollY={scrollY} />
        <GravitationalLensing scrollY={scrollY} />
        
        {/* Decorative orbiting moons */}
        <OrbitingMoons scrollY={scrollY} />
        <CosmicDust count={2500} scrollY={scrollY} />
        
        {/* Galaxy effects */}
        <GalaxyParticles count={45000} scrollY={scrollY} />
        <AnimatedStars scrollY={scrollY} />
        <ShootingStars count={20} scrollY={scrollY} />
        <NebulaCloud scrollY={scrollY} />
      </Canvas>
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1929]/50 via-transparent to-[#0B1929]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0B1929]/40 pointer-events-none" />
    </div>
  );
};

export default GalaxyBackground;
