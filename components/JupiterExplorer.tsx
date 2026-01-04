import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';

export type JupiterView = 'orbit' | 'atmosphere' | 'surface';

interface JupiterExplorerProps {
  currentView: JupiterView;
  onViewChange: (view: JupiterView) => void;
  isWarping: boolean;
  onWarpComplete: () => void;
}

// ============================================
// FTL/WARP ANIMATION COMPONENT
// ============================================
export const WarpEffect: React.FC<{ isActive: boolean; onComplete: () => void }> = ({ 
  isActive, 
  onComplete 
}) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Central bright flash */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0.3, 0.9, 0],
            }}
            transition={{ 
              duration: 2,
              times: [0, 0.1, 0.5, 0.7, 1],
              ease: "easeInOut"
            }}
          />
          
          {/* Star streaks container */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Radial star streaks */}
            {[...Array(60)].map((_, i) => {
              const angle = (i / 60) * 360;
              const delay = Math.random() * 0.3;
              return (
                <motion.div
                  key={i}
                  className="absolute w-1 bg-gradient-to-r from-transparent via-cyan-300 to-white"
                  style={{
                    height: '2px',
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg)`,
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ 
                    width: ['0vw', '100vw'],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: delay,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </div>

          {/* Tunnel effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,200,255,0.3) 30%, rgba(100,50,200,0.5) 60%, #0B1929 100%)',
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 3, 5],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Speed lines overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 49%,
                rgba(255,255,255,0.1) 49%,
                rgba(255,255,255,0.1) 51%,
                transparent 51%
              )`,
              backgroundSize: '4px 100%',
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scaleX: [1, 20, 40],
            }}
            transition={{ duration: 1.8, ease: "easeIn" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// ATMOSPHERE VIEW COMPONENT
// ============================================
export const AtmosphereView: React.FC<{ 
  isVisible: boolean; 
  onScrollToSurface: () => void;
}> = ({ isVisible, onScrollToSurface }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 50) {
        onScrollToSurface();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: true });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isVisible, onScrollToSurface]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(/Jupiter/textures/at.jpg)',
              filter: 'brightness(0.7) contrast(1.1)',
            }}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Animated atmosphere effects */}
          <div className="absolute inset-0">
            {/* Swirling clouds overlay */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(45deg, rgba(255,150,50,0.2) 0%, transparent 50%, rgba(200,100,50,0.2) 100%)',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Floating particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-orange-300/50 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          {/* Text content */}
          <motion.div
            className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-wider"
              style={{ textShadow: '0 0 40px rgba(255,150,50,0.5)' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              ATMOSFERA JOWISZA
            </motion.h1>
            
            <motion.div
              className="max-w-3xl space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <p className="text-xl md:text-2xl text-orange-100 leading-relaxed">
                Wkraczasz w najgłębszą atmosferę Układu Słonecznego - 
                <span className="text-orange-400 font-semibold"> 5000 km</span> wirujących chmur 
                amoniaku, siarkowodoru i wody.
              </p>
              
              <p className="text-lg text-orange-200/80 leading-relaxed">
                Wiatry osiągają tutaj prędkość <span className="text-cyan-300">620 km/h</span>, 
                a błyskawice są <span className="text-yellow-300">tysiące razy</span> potężniejsze 
                niż na Ziemi. Wielka Czerwona Plama - burza większa od naszej planety - 
                szaleje tu już od <span className="text-red-400">400 lat</span>.
              </p>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-12 flex flex-col items-center text-white/60"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm mb-2">Przewiń w dół, by zejść głębiej</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// SURFACE VIEW COMPONENT
// ============================================
export const SurfaceView: React.FC<{ 
  isVisible: boolean;
  onReturnToOrbit: () => void;
}> = ({ isVisible, onReturnToOrbit }) => {
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
          {/* Background image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(/Jupiter/textures/su.png)',
              filter: 'brightness(0.8) saturate(1.2)',
            }}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Animated surface effects */}
          <div className="absolute inset-0">
            {/* Heat distortion effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at bottom, rgba(255,100,0,0.2) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Rising gas particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-8 bg-gradient-to-t from-orange-500/30 to-transparent rounded-full blur-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: '-20px',
                }}
                animate={{
                  y: [0, -window.innerHeight - 100],
                  opacity: [0, 0.6, 0],
                  scaleY: [1, 2, 0.5],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

          {/* Text content */}
          <motion.div
            className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center"
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
              GŁĘBINY JOWISZA
            </motion.h1>
            
            <motion.div
              className="max-w-3xl space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <p className="text-xl md:text-2xl text-orange-100 leading-relaxed">
                Docierasz do miejsca, gdzie <span className="text-red-400 font-semibold">ciśnienie</span> jest 
                miliony razy większe niż na Ziemi, a wodór staje się 
                <span className="text-cyan-300 font-semibold"> metaliczny</span>.
              </p>
              
              <p className="text-lg text-orange-200/80 leading-relaxed">
                Pod chmurami kryje się ocean <span className="text-blue-300">ciekłego wodoru</span> - 
                największy w Układzie Słonecznym. Temperatura rośnie do 
                <span className="text-yellow-400"> 20,000°C</span> w jądrze, gdzie prawdopodobnie 
                znajduje się skaliste centrum <span className="text-purple-300">20 razy</span> masywniejsze od Ziemi.
              </p>
              
              <p className="text-base text-orange-300/70 mt-6 italic">
                "Gdyby Jowisz był 80 razy masywniejszy, stałby się gwiazdą."
              </p>
            </motion.div>
          </motion.div>

          {/* Return to Orbit Button */}
          <motion.button
            className="fixed bottom-8 right-8 z-20 group"
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

// ============================================
// MAIN JUPITER EXPLORER HOOK
// ============================================
export const useJupiterExplorer = () => {
  const [currentView, setCurrentView] = useState<JupiterView>('orbit');
  const [isWarping, setIsWarping] = useState(false);
  const [targetView, setTargetView] = useState<JupiterView>('orbit');

  const initiateWarp = useCallback((destination: JupiterView) => {
    setTargetView(destination);
    setIsWarping(true);
  }, []);

  const handleWarpComplete = useCallback(() => {
    setCurrentView(targetView);
    setIsWarping(false);
  }, [targetView]);

  const enterAtmosphere = useCallback(() => {
    initiateWarp('atmosphere');
  }, [initiateWarp]);

  const enterSurface = useCallback(() => {
    initiateWarp('surface');
  }, [initiateWarp]);

  const returnToOrbit = useCallback(() => {
    initiateWarp('orbit');
  }, [initiateWarp]);

  return {
    currentView,
    isWarping,
    enterAtmosphere,
    enterSurface,
    returnToOrbit,
    handleWarpComplete,
  };
};

export default useJupiterExplorer;
