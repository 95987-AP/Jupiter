import React, { useEffect, useState, useCallback } from 'react';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

// List of all textures to preload
const TEXTURES_TO_LOAD = [
  '/Jupiter/textures/Moons/io-moon.jpg',
  '/Jupiter/textures/Moons/europa-moon.jpg',
  '/Jupiter/textures/Moons/ganymede-moon.jpg',
  '/Jupiter/textures/Moons/callisto-moon.jpg',
  '/Jupiter/textures/jupiter-texture.jpg', // Main Jupiter texture if exists
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [isComplete, setIsComplete] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const loadTextures = useCallback(async () => {
    const textures = TEXTURES_TO_LOAD;
    let loaded = 0;
    const total = textures.length;

    const loadingMessages = [
      'Scanning the cosmos...',
      'Approaching Jupiter system...',
      'Loading moon textures...',
      'Calibrating gravitational lensing...',
      'Preparing Galilean moons...',
      'Almost there...',
    ];

    for (let i = 0; i < textures.length; i++) {
      const texture = textures[i];
      setLoadingText(loadingMessages[Math.min(i, loadingMessages.length - 1)]);

      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => {
            // Continue even if texture fails to load
            console.warn(`Failed to preload: ${texture}`);
            resolve();
          };
          img.src = texture;
        });
      } catch (error) {
        console.warn(`Error loading texture: ${texture}`);
      }

      loaded++;
      // Smooth progress animation
      const targetProgress = Math.round((loaded / total) * 100);
      setProgress(targetProgress);
    }

    // Add a small delay for visual polish
    setLoadingText('Welcome to Jupiter');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsComplete(true);
    setIsFadingOut(true);
    
    // Wait for fade-out animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    onLoadComplete();
  }, [onLoadComplete]);

  useEffect(() => {
    loadTextures();
  }, [loadTextures]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#050816] flex flex-col items-center justify-center
                  transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
            }}
          />
        ))}
      </div>

      {/* Jupiter icon/animation */}
      <div className="relative mb-12">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-jupiter-orange via-amber-600 to-jupiter-orange
                        shadow-[0_0_60px_rgba(243,156,18,0.4)] animate-pulse relative overflow-hidden">
          {/* Jupiter bands */}
          <div className="absolute inset-0 opacity-60">
            <div className="absolute w-full h-2 bg-amber-800/50 top-[20%]" />
            <div className="absolute w-full h-3 bg-red-800/40 top-[35%]" />
            <div className="absolute w-full h-2 bg-amber-700/50 top-[55%]" />
            <div className="absolute w-full h-4 bg-amber-900/40 top-[70%]" />
          </div>
          {/* Great Red Spot */}
          <div 
            className="absolute w-6 h-4 rounded-full bg-gradient-to-r from-red-700 to-red-600 
                       left-[55%] top-[35%] shadow-inner animate-spin"
            style={{ animationDuration: '30s' }}
          />
        </div>
        
        {/* Orbiting moon */}
        <div 
          className="absolute w-4 h-4 rounded-full bg-gray-400 shadow-lg"
          style={{
            animation: 'orbit 4s linear infinite',
            transformOrigin: 'center',
          }}
        />
      </div>

      {/* Loading text */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wide">
        JUPITER EXPERIENCE
      </h2>
      <p className="text-jupiter-orange mb-8 text-lg animate-pulse">
        {loadingText}
      </p>

      {/* Progress bar */}
      <div className="w-64 md:w-80 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-jupiter-orange via-amber-500 to-jupiter-orange
                     rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Progress percentage */}
      <p className="text-white/60 mt-4 text-sm tracking-widest">
        {progress}%
      </p>

      {/* Ready state */}
      {isComplete && (
        <p className="absolute bottom-10 text-white/40 text-sm animate-pulse">
          Entering the Jovian System...
        </p>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(80px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(80px) rotate(-360deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
