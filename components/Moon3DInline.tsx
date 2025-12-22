import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Moon3DInlineProps {
  texture: string;
  atmosphereColor: string;
  moonName: string;
}

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
    finalColor += uAtmosphereColor * fresnel * 0.4;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Atmosphere shader
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 uAtmosphereColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float intensity = pow(0.65 - dot(vNormal, viewDir), 2.0);
    vec3 color = uAtmosphereColor * intensity * 0.8;
    float alpha = intensity * 0.4;
    gl_FragColor = vec4(color, alpha);
  }
`;

const MoonSphere: React.FC<{ texture: string; atmosphereColor: string }> = ({ 
  texture, 
  atmosphereColor 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [loadedTexture, setLoadedTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!texture) return;
    
    const loader = new THREE.TextureLoader();
    loader.load(
      texture,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        setLoadedTexture(tex);
      },
      undefined,
      (err) => console.error(`Error loading texture:`, err)
    );
  }, [texture]);

  const surfaceMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uTime: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
        uAtmosphereColor: { value: new THREE.Color(atmosphereColor) },
      },
      vertexShader: surfaceVertexShader,
      fragmentShader: surfaceFragmentShader,
    });
  }, [atmosphereColor]);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uAtmosphereColor: { value: new THREE.Color(atmosphereColor) },
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

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1;
      meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
    }

    if (surfaceMaterial) {
      surfaceMaterial.uniforms.uTime.value = time;
    }
  });

  if (!loadedTexture) {
    return (
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={atmosphereColor} />
      </mesh>
    );
  }

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={surfaceMaterial} />
      </mesh>
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>
    </group>
  );
};

const Moon3DInline: React.FC<Moon3DInlineProps> = ({ 
  texture, 
  atmosphereColor,
  moonName 
}) => {
  return (
    <div className="aspect-square w-full max-w-md mx-auto">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#FFF8E7" />
        <directionalLight position={[-3, 1, 2]} intensity={0.5} color={atmosphereColor} />
        
        <MoonSphere texture={texture} atmosphereColor={atmosphereColor} />
      </Canvas>
    </div>
  );
};

export default Moon3DInline;
