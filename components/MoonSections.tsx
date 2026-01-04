import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JUPITER_MOONS } from '../constants';
import Moon3DInline from './Moon3DInline';

gsap.registerPlugin(ScrollTrigger);

// MoonSections component with pointer-events-auto for interactivity
const MoonSections = () => {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeMoonIndex, setActiveMoonIndex] = useState<number>(-1);
  const animationRefs = useRef<gsap.core.Timeline[]>([]);

  // Track which section is currently active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setActiveMoonIndex(index);
            }
          }
        });
      },
      {
        threshold: [0.5, 0.75],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Trigger animation when moon becomes active
  useEffect(() => {
    if (activeMoonIndex === -1) return;

    const section = sectionRefs.current[activeMoonIndex];
    if (!section) return;

    const moonInner = section.querySelector('.moon-inner-wrapper');
    const title = section.querySelector('.moon-title');
    const description = section.querySelector('.moon-description');
    const stats = section.querySelector('.moon-stats');
    const additionalInfo = section.querySelector('.additional-info');

    // Clear any existing animation
    if (animationRefs.current[activeMoonIndex]) {
      animationRefs.current[activeMoonIndex].kill();
    }

    // Create new timeline for this moon - with performance optimizations
    const tl = gsap.timeline({
      defaults: {
        force3D: true, // Enable GPU acceleration
        ease: 'power2.out'
      }
    });
    animationRefs.current[activeMoonIndex] = tl;

    // Animate moon flying in from distance - NO rotation, just scale and position
    if (moonInner) {
      tl.fromTo(moonInner,
        { 
          scale: 0.1,
          opacity: 0,
          z: -500,
        },
        { 
          scale: 1,
          opacity: 1,
          z: 0,
          duration: 1.5,
          ease: 'power3.out',
        },
        0
      );
    }

    // Animate title
    if (title) {
      tl.fromTo(title,
        { 
          opacity: 0, 
          x: activeMoonIndex % 2 === 0 ? 80 : -80,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
        },
        0.2
      );
    }

    // Animate description
    if (description) {
      tl.fromTo(description,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
        },
        0.4
      );
    }

    // Animate stats
    if (stats) {
      const statItems = stats.querySelectorAll('.stat-item');
      tl.fromTo(statItems,
        { opacity: 0, y: 15, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.5)',
        },
        0.6
      );
    }

    // Animate additional info
    if (additionalInfo) {
      tl.fromTo(additionalInfo,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
        },
        0.9
      );
    }

  }, [activeMoonIndex]);

  const MOON_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
    io: { primary: '#F4D03F', secondary: '#FF6B00', glow: 'rgba(244, 208, 63, 0.3)' },
    europa: { primary: '#87CEEB', secondary: '#E8F4F8', glow: 'rgba(135, 206, 235, 0.3)' },
    ganymede: { primary: '#AAB7B8', secondary: '#566573', glow: 'rgba(170, 183, 184, 0.3)' },
    callisto: { primary: '#8B7355', secondary: '#5D4E37', glow: 'rgba(139, 115, 85, 0.3)' },
  };

  return (
    <div className="relative pointer-events-auto">
      {/* Jupiter intro section */}
      <section 
        className="min-h-screen snap-start flex items-center justify-center relative"
      >
        <div className="text-center max-w-3xl mx-auto px-6 animate-fade-in">
          <span className="inline-block px-4 py-2 rounded-full text-xs uppercase tracking-widest 
                         bg-jupiter-orange/20 text-jupiter-orange border border-jupiter-orange/30 mb-6">
            Approaching Jovian System
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
            The Galilean Moons
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Scroll to explore Jupiter's four largest moons - the Galilean satellites discovered in 1610.
            Each moon is a world unto itself, with unique geological features and mysteries.
          </p>
          <div className="mt-8 text-gray-400 text-sm animate-bounce">
            ↓ Scroll to explore ↓
          </div>
        </div>
      </section>

      {/* Moon sections */}
      {JUPITER_MOONS.map((moon, index) => {
        const colors = MOON_COLORS[moon.id];
        
        return (
          <section
            key={moon.id}
            ref={el => { sectionRefs.current[index] = el; }}
            className="min-h-screen snap-start flex items-center justify-center relative py-20"
          >
            {/* Ambient glow */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
              style={{
                background: `radial-gradient(ellipse at ${index % 2 === 0 ? '30%' : '70%'} 50%, 
                            ${colors.glow}, transparent 50%)`,
                opacity: activeMoonIndex === index ? 1 : 0.3
              }}
            />

            <div className="moon-content max-w-6xl mx-auto px-6 w-full">
              <div className={`flex items-center gap-16 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                {/* 3D Moon */}
                <div className="flex-1 moon-3d-container relative" style={{ perspective: '1500px' }}>
                  <div className="moon-inner-wrapper relative" style={{ transformStyle: 'preserve-3d' }}>
                    <Moon3DInline 
                      texture={moon.texture || ''} 
                      atmosphereColor={colors.primary}
                      moonName={moon.name}
                    />
                  </div>
                  {/* Orbit ring decoration */}
                  <div 
                    className="absolute inset-[-15%] rounded-full border opacity-20 animate-spin"
                    style={{ 
                      borderColor: colors.primary,
                      animationDuration: '20s',
                    }}
                  />
                  <div 
                    className="absolute inset-[-25%] rounded-full border opacity-10"
                    style={{ 
                      borderColor: colors.primary,
                      borderStyle: 'dashed',
                    }}
                  />
                </div>

                {/* Moon info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <span 
                      className="text-xs uppercase tracking-ultra-wide mb-2 block font-hero font-bold"
                      style={{ color: colors.primary }}
                    >
                      Moon {index + 1} of 4
                    </span>
                    <h2 
                      className="moon-title text-5xl md:text-6xl font-display font-extrabold tracking-tighter leading-extra-tight"
                      style={{ 
                        color: colors.primary,
                        textShadow: `0 0 30px ${colors.glow}`
                      }}
                    >
                      {moon.name}
                    </h2>
                  </div>

                  <p className="moon-description text-base md:text-lg text-gray-300 leading-relaxed font-sans font-light tracking-wide">
                    {moon.description}
                  </p>

                  <div className="moon-stats grid grid-cols-2 gap-4">
                    <div className="stat-item p-4 rounded-xl bg-white/5 backdrop-blur-sm 
                                  border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-xs text-gray-400 block mb-1 font-hero uppercase tracking-wider">Radius</span>
                      <span 
                        className="text-xl md:text-2xl font-display font-bold tracking-tight"
                        style={{ color: colors.primary }}
                      >
                        {moon.radius}
                      </span>
                    </div>
                    <div className="stat-item p-4 rounded-xl bg-white/5 backdrop-blur-sm 
                                  border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-xs text-gray-400 block mb-1 font-hero uppercase tracking-wider">Distance from Jupiter</span>
                      <span 
                        className="text-xl md:text-2xl font-display font-bold tracking-tight"
                        style={{ color: colors.primary }}
                      >
                        {moon.distance}
                      </span>
                    </div>
                  </div>

                  {/* Additional info based on moon */}
                  <div className="additional-info text-gray-400 text-sm leading-relaxed pt-4 border-t border-white/10">
                    {moon.id === 'io' && (
                      <p>🌋 Over 400 active volcanoes make Io the most geologically active body in our solar system. Its surface is constantly being reshaped by volcanic eruptions.</p>
                    )}
                    {moon.id === 'europa' && (
                      <p>🧊 Beneath Europa's icy shell lies a global ocean containing twice the water of Earth's oceans. Scientists consider it one of the most promising places to search for life beyond Earth.</p>
                    )}
                    {moon.id === 'ganymede' && (
                      <p>🛡️ Ganymede is the only moon known to have its own magnetic field. It's larger than Mercury and contains more water than all of Earth's oceans.</p>
                    )}
                    {moon.id === 'callisto' && (
                      <p>☄️ Callisto's heavily cratered surface is the oldest and most cratered landscape known. It may also have a subsurface ocean despite lacking active geology.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default MoonSections;
