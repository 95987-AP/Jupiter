import React, { Suspense, useState, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import GalaxyBackground from './components/GalaxyBackground';
import HeroSection from './components/HeroSection';
import MoonSections from './components/MoonSections';
import InfoCards from './components/InfoCards';
import Timeline from './components/Timeline';
import MoonIndicator from './components/MoonIndicator';
import LoadingScreen from './components/LoadingScreen';
import JupiterSurfaceTerrain from './components/JupiterSurfaceTerrain';
import JupiterAtmosphereStorm from './components/JupiterAtmosphereStorm';
import { 
  WarpEffect, 
  useJupiterExplorer,
  JupiterView 
} from './components/JupiterExplorer';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const {
    currentView,
    isWarping,
    enterAtmosphere,
    enterSurface,
    returnToOrbit,
    handleWarpComplete,
  } = useJupiterExplorer();

  const handleLoadComplete = () => {
    setIsLoaded(true);
  };

  // Hide main content when not in orbit view
  const showMainContent = currentView === 'orbit' && !isWarping;

  return (
    <div className="relative min-h-screen font-sans selection:bg-jupiter-orange selection:text-white">
      {/* Loading Screen */}
      {!isLoaded && <LoadingScreen onLoadComplete={handleLoadComplete} />}

      {/* FTL/Warp Effect */}
      <WarpEffect isActive={isWarping} onComplete={handleWarpComplete} />

      {/* Atmosphere View - 3D Storm */}
      <JupiterAtmosphereStorm 
        isVisible={currentView === 'atmosphere' && !isWarping} 
        onScrollToSurface={enterSurface}
      />

      {/* Surface View - 3D Terrain */}
      <JupiterSurfaceTerrain 
        isVisible={currentView === 'surface' && !isWarping}
        onReturnToOrbit={returnToOrbit}
      />

      {/* 3D Background - Only visible in orbit view */}
      {showMainContent && (
        <ErrorBoundary
          fallback={
            <div className="fixed inset-0 bg-gradient-to-b from-[#0B1929] to-[#1a2332] flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="text-6xl mb-4">🪐</div>
                <h2 className="text-2xl font-bold mb-2">Jupiter Experience</h2>
                <p className="text-gray-400">3D view not available in this browser</p>
                <p className="text-sm text-gray-500 mt-2">Try Chrome or Edge for full experience</p>
              </div>
            </div>
          }
        >
          <Suspense fallback={
            <div className="fixed inset-0 bg-[#0B1929] flex items-center justify-center">
              <div className="text-center text-jupiter-orange">
                <div className="spinner w-16 h-16 mx-auto mb-4"></div>
                <p className="text-xl animate-pulse">Loading Jupiter...</p>
              </div>
            </div>
          }>
            <GalaxyBackground onJupiterClick={enterAtmosphere} />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Foreground Content - Only visible in orbit view */}
      {showMainContent && (
        <div className={`relative z-10 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ pointerEvents: 'none' }}>
          <MoonIndicator />
          
          <main>
            <HeroSection />
            <MoonSections />
            <InfoCards />
            <Timeline />
          </main>

          {/* Subtle Author Credit */}
          <div className="fixed bottom-4 right-4 z-50 text-right">
            <p className="text-white/30 text-xs tracking-wide">
              Aleksander Pietrzak
            </p>
            <p className="text-jupiter-orange/40 text-xs tracking-wider">
              @AlpiSketch
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
