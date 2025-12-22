import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Moon3DProps {
  texture: string;
  atmosphereColor: string;
  position: [number, number, number];
  scale: number;
  visible: boolean;
  opacity: number;
}

// Custom shader for moon atmosphere with fresnel effect
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 uAtmosphereColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Fresnel effect for atmosphere glow
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    
    // Add some variation
    float glow = intensity * 1.5;
    
    vec3 color = uAtmosphereColor * glow;
    float alpha = intensity * uOpacity * 0.8;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Surface shader for realistic moon rendering
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
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec4 textureColor = texture2D(uTexture, vUv);
    
    // Simple diffuse lighting
    float diffuse = max(dot(vNormal, normalize(uSunDirection)), 0.0);
    diffuse = diffuse * 0.7 + 0.3; // Add ambient
    
    // Fresnel rim lighting
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
    
    vec3 finalColor = textureColor.rgb * diffuse;
    finalColor += fresnel * 0.15; // Subtle rim light
    
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

const Moon3D: React.FC<Moon3DProps> = ({ 
  texture, 
  atmosphereColor, 
  position, 
  scale, 
  visible,
  opacity 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);

  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      texture,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        setLoadedTexture(tex);
      },
      undefined,
      (err) => console.error('Error loading moon texture:', err)
    );
  }, [texture]);

  // Surface material with custom shader
  const surfaceMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uSunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
      },
      vertexShader: surfaceVertexShader,
      fragmentShader: surfaceFragmentShader,
      transparent: true,
    });
  }, []);

  // Atmosphere material
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uAtmosphereColor: { value: new THREE.Color(atmosphereColor) },
        uOpacity: { value: 0.6 },
      },
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [atmosphereColor]);

  // Update texture when loaded
  useEffect(() => {
    if (loadedTexture && surfaceMaterial) {
      surfaceMaterial.uniforms.uTexture.value = loadedTexture;
    }
  }, [loadedTexture, surfaceMaterial]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.y = time * 0.05;
    }

    if (surfaceMaterial) {
      surfaceMaterial.uniforms.uTime.value = time;
      surfaceMaterial.uniforms.uOpacity.value = opacity;
    }

    if (atmosphereMaterial) {
      atmosphereMaterial.uniforms.uOpacity.value = opacity * 0.6;
    }

    if (groupRef.current) {
      groupRef.current.visible = visible;
    }
  });

  if (!loadedTexture) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Moon surface */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={surfaceMaterial} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>

      {/* Inner glow */}
      <mesh scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={opacity * 0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light for self-illumination */}
      <pointLight
        color={atmosphereColor}
        intensity={opacity * 0.5}
        distance={5}
        decay={2}
      />
    </group>
  );
};

export default Moon3D;
