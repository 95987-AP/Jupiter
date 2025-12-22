import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JUPITER_MOONS } from '../constants';
import Moon3DInline from './Moon3DInline';

gsap.registerPlugin(ScrollTrigger);

const MoonSections = () => {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      sectionRefs.current.forEach((section, index) => {
        if (!section) return;

        const content = section.querySelector('.moon-content');
        const title = section.querySelector('.moon-title');
        const stats = section.querySelector('.moon-stats');
        const moon3d = section.querySelector('.moon-3d-container');
        const moonInner = section.querySelector('.moon-inner-wrapper');

        // Parallax fade-in animation for content container
        gsap.fromTo(content, 
          {
            opacity: 0,
            y: 100,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 90%',
              end: 'top 40%',
              scrub: 1.5,
            }
          }
        );

        // 3D Moon animation - SMOOTH fly-in from deep space
        if (moon3d && moonInner) {
          // Create a timeline for the moon approach
          const moonTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 100%', // Start earlier for more time
              end: 'top 20%', // End later for longer animation
              scrub: 2, // Slower scrub for smoother animation
            }
          });

          // Phase 1: Start from very far away and tiny
          moonTimeline.fromTo(moonInner,
            { 
              scale: 0.05,
              opacity: 0,
              rotateY: index % 2 === 0 ? -30 : 30,
              z: -500,
              filter: 'blur(10px)',
            },
            { 
              scale: 0.3,
              opacity: 0.4,
              rotateY: index % 2 === 0 ? -15 : 15,
              z: -250,
              filter: 'blur(5px)',
              duration: 0.4,
              ease: 'power1.out',
            }
          );

          // Phase 2: Continue approaching
          moonTimeline.to(moonInner, {
            scale: 0.6,
            opacity: 0.7,
            rotateY: index % 2 === 0 ? -5 : 5,
            z: -100,
            filter: 'blur(2px)',
            duration: 0.3,
            ease: 'power2.out',
          });

          // Phase 3: Final approach - full size and clarity
          moonTimeline.to(moonInner, {
            scale: 1,
            opacity: 1,
            rotateY: 0,
            z: 0,
            filter: 'blur(0px)',
            duration: 0.3,
            ease: 'power2.out',
          });
        }

        // Title animation - slide in from side
        gsap.fromTo(title,
          { 
            opacity: 0, 
            x: index % 2 === 0 ? 80 : -80, 
            filter: 'blur(15px)',
            scale: 0.9,
          },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            scale: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'top 35%',
              scrub: 1.5,
            }
          }
        );

        // Stats stagger animation
        if (stats) {
          const statItems = stats.querySelectorAll('.stat-item');
          gsap.fromTo(statItems,
            { 
              opacity: 0, 
              y: 40,
              scale: 0.9,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.15,
              scrollTrigger: {
                trigger: section,
                start: 'top 60%',
                end: 'top 25%',
                scrub: 1.5,
              }
            }
          );
        }

        // Fade out on scroll past
        gsap.fromTo(content,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -80,
            scale: 0.95,
            scrollTrigger: {
              trigger: section,
              start: 'bottom 80%',
              end: 'bottom 20%',
              scrub: 1.5,
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const MOON_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
    io: { primary: '#F4D03F', secondary: '#FF6B00', glow: 'rgba(244, 208, 63, 0.3)' },
    europa: { primary: '#87CEEB', secondary: '#E8F4F8', glow: 'rgba(135, 206, 235, 0.3)' },
    ganymede: { primary: '#AAB7B8', secondary: '#566573', glow: 'rgba(170, 183, 184, 0.3)' },
    callisto: { primary: '#8B7355', secondary: '#5D4E37', glow: 'rgba(139, 115, 85, 0.3)' },
  };

  return (
    <div className="relative">
      {/* Jupiter intro section - spacer to sync with 3D camera */}
      <section 
        className="min-h-[150vh] flex items-end justify-center relative pb-20"
      >
        <div className="text-center max-w-3xl mx-auto px-6 opacity-0 animate-fade-in-delayed">
          <span className="inline-block px-4 py-2 rounded-full text-xs uppercase tracking-widest 
                         bg-jupiter-orange/20 text-jupiter-orange border border-jupiter-orange/30 mb-6">
            Approaching Jovian System
          </span>
          <p className="text-xl text-gray-300 leading-relaxed">
            Scroll to explore Jupiter's four largest moons - the Galilean satellites discovered in 1610.
            Each moon is a world unto itself, with unique geological features and mysteries.
          </p>
        </div>
      </section>

      {/* Moon sections */}
      {JUPITER_MOONS.map((moon, index) => {
        const colors = MOON_COLORS[moon.id];
        
        return (
          <section
            key={moon.id}
            ref={el => { sectionRefs.current[index] = el; }}
            className="min-h-screen flex items-center justify-center relative py-20"
          >
            {/* Ambient glow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at ${index % 2 === 0 ? '30%' : '70%'} 50%, 
                            ${colors.glow}, transparent 50%)`
              }}
            />

            <div className="moon-content max-w-6xl mx-auto px-6 w-full">
              <div className={`flex items-center gap-16 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                {/* 3D Moon */}
                <div className="flex-1 moon-3d-container relative" style={{ perspective: '1200px' }}>
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
                      className="text-sm uppercase tracking-widest mb-2 block"
                      style={{ color: colors.primary }}
                    >
                      Moon {index + 1} of 4
                    </span>
                    <h2 
                      className="moon-title text-5xl md:text-6xl font-bold tracking-tight"
                      style={{ 
                        color: colors.primary,
                        textShadow: `0 0 30px ${colors.glow}`
                      }}
                    >
                      {moon.name}
                    </h2>
                  </div>

                  <p className="moon-description text-lg md:text-xl text-gray-300 leading-relaxed">
                    {moon.description}
                  </p>

                  <div className="moon-stats grid grid-cols-2 gap-4">
                    <div className="stat-item p-4 rounded-xl bg-white/5 backdrop-blur-sm 
                                  border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-sm text-gray-400 block mb-1">Radius</span>
                      <span 
                        className="text-xl md:text-2xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {moon.radius}
                      </span>
                    </div>
                    <div className="stat-item p-4 rounded-xl bg-white/5 backdrop-blur-sm 
                                  border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-sm text-gray-400 block mb-1">Distance from Jupiter</span>
                      <span 
                        className="text-xl md:text-2xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {moon.distance}
                      </span>
                    </div>
                  </div>

                  {/* Additional info based on moon */}
                  <div className="stat-item text-gray-400 text-sm leading-relaxed pt-4 border-t border-white/10">
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
