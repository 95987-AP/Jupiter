import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JUPITER_MOONS } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const MoonGallery = () => {
  const [activeMoon, setActiveMoon] = useState(JUPITER_MOONS[0]);
  const [loadedTextures, setLoadedTextures] = useState<Record<string, boolean>>({});
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const orbitRingRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const glowOrbsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Preload moon textures
  useEffect(() => {
    JUPITER_MOONS.forEach((moon) => {
      if (moon.texture) {
        const img = new Image();
        img.onload = () => {
          setLoadedTextures(prev => ({ ...prev, [moon.id]: true }));
        };
        img.src = moon.texture;
      }
    });
  }, []);

  // Mouse parallax for moon
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (visualRef.current) {
        const rect = visualRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Apply parallax to moon
  useEffect(() => {
    if (moonRef.current) {
      gsap.to(moonRef.current, {
        x: mousePosition.x * 30,
        y: mousePosition.y * 30,
        rotationY: mousePosition.x * 15,
        rotationX: -mousePosition.y * 15,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, [mousePosition]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation with enhanced effect
      gsap.from(titleRef.current, {
        opacity: 0,
        x: 40,
        filter: 'blur(10px)',
        duration: 1,
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          once: true,
        }
      });

      // Buttons stagger animation with 3D effect
      buttonsRef.current.forEach((btn, index) => {
        if (btn) {
          gsap.from(btn, {
            opacity: 0,
            x: 80,
            rotationY: -30,
            duration: 0.8,
            delay: index * 0.12,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: btn,
              start: 'top 85%',
              once: true,
            }
          });
        }
      });

      // Orbit ring continuous rotation with pulsing
      gsap.to(orbitRingRef.current, {
        rotate: 360,
        duration: 25,
        repeat: -1,
        ease: 'none',
      });

      // Glowing orbs animation
      glowOrbsRef.current.forEach((orb, index) => {
        if (orb) {
          gsap.to(orb, {
            scale: `random(0.8, 1.3)`,
            opacity: `random(0.3, 0.7)`,
            x: `random(-50, 50)`,
            y: `random(-50, 50)`,
            duration: `random(3, 6)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.5
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Enhanced moon transition animation
    if (moonRef.current) {
      gsap.fromTo(moonRef.current, 
        { 
          opacity: 0, 
          scale: 0.5, 
          rotateY: -180,
          filter: 'blur(20px)'
        },
        { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          filter: 'blur(0px)',
          duration: 1, 
          ease: 'elastic.out(1, 0.6)' 
        }
      );
    }
  }, [activeMoon]);

  return (
    <section ref={sectionRef} id="moons" className="relative z-10 py-32 bg-black/30 backdrop-blur-sm border-y border-white/5 overflow-hidden">
      {/* Animated glow orbs */}
      <div 
        ref={(el) => glowOrbsRef.current[0] = el}
        className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
      />
      <div 
        ref={(el) => glowOrbsRef.current[1] = el}
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"
      />
      <div 
        ref={(el) => glowOrbsRef.current[2] = el}
        className="absolute top-1/2 left-0 w-64 h-64 bg-jupiter-orange/10 rounded-full blur-3xl"
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Visual Side */}
          <div ref={visualRef} className="flex-1 w-full flex justify-center items-center perspective-1000">
            <div className="relative w-64 h-64 md:w-96 md:h-96">
              <div
                ref={moonRef}
                key={activeMoon.id}
                className="w-full h-full rounded-full shadow-[0_0_80px_rgba(0,0,0,0.8)] absolute top-0 left-0 transform-gpu overflow-hidden"
                style={{ 
                  background: activeMoon.texture && loadedTextures[activeMoon.id]
                    ? `url(${activeMoon.texture}) center/cover`
                    : `radial-gradient(circle at 30% 30%, ${activeMoon.imageColor}, #000)`,
                  boxShadow: `0 0 80px ${activeMoon.imageColor}50, inset -25px -25px 70px rgba(0,0,0,0.6), 0 0 120px ${activeMoon.imageColor}30`
                }}
              >
                <div 
                  className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay"
                  ref={(el) => {
                    if (el) {
                      gsap.to(el, { rotate: 360, duration: 25, repeat: -1, ease: 'none' });
                    }
                  }}
                  style={{
                    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)'
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
                  ref={(el) => {
                    if (el) {
                      gsap.to(el, { opacity: 0.5, duration: 2, repeat: -1, yoyo: true, ease: 'power1.inOut' });
                    }
                  }}
                />
                
                {/* Surface texture animation */}
                <div 
                  className="absolute inset-0 rounded-full overflow-hidden"
                  ref={(el) => {
                    if (el) {
                      gsap.to(el, { 
                        backgroundPosition: '100% 0%', 
                        duration: 30, 
                        repeat: -1, 
                        ease: 'none' 
                      });
                    }
                  }}
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)`,
                    backgroundSize: '200% 100%'
                  }}
                />
              </div>
              
              {/* Multiple orbital rings */}
              <div
                ref={orbitRingRef}
                className="absolute inset-0 rounded-full border-2 border-jupiter-orange/20"
                style={{ scale: 1.2 }}
              />
              <div
                className="absolute inset-0 rounded-full border border-purple-500/15"
                style={{ scale: 1.35 }}
                ref={(el) => {
                  if (el) {
                    gsap.to(el, { rotate: -360, duration: 35, repeat: -1, ease: 'none' });
                  }
                }}
              />
              <div
                className="absolute inset-0 rounded-full border border-cyan-500/10"
                style={{ scale: 1.5 }}
                ref={(el) => {
                  if (el) {
                    gsap.to(el, { rotate: 360, duration: 45, repeat: -1, ease: 'none' });
                  }
                }}
              />
            </div>
          </div>

          {/* Content Side */}
          <div className="flex-1 w-full">
            <h2 
              ref={titleRef}
              className="text-4xl md:text-5xl font-display font-bold text-white mb-8"
            >
              The Galilean Moons
            </h2>

            <div className="space-y-6">
              {JUPITER_MOONS.map((moon, index) => (
                <button
                  key={moon.id}
                  ref={(el) => (buttonsRef.current[index] = el)}
                  onClick={() => setActiveMoon(moon)}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { 
                      scale: 1.03, 
                      x: 15, 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      duration: 0.4,
                      ease: 'back.out(1.7)'
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { 
                      scale: 1, 
                      x: 0,
                      boxShadow: '0 0 0 rgba(0,0,0,0)',
                      duration: 0.4 
                    });
                  }}
                  className={`w-full text-left p-6 rounded-xl border transition-all duration-300 group relative overflow-hidden transform-gpu ${
                    activeMoon.id === moon.id
                      ? 'bg-jupiter-orange/10 border-jupiter-orange shadow-[0_0_40px_rgba(255,107,53,0.25)]'
                      : 'bg-transparent border-white/10 hover:bg-white/5'
                  }`}
                >
                  {activeMoon.id === moon.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-jupiter-orange/15 via-purple-600/5 to-transparent" />
                  )}
                  
                  {/* Hover glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-jupiter-orange/10 to-purple-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <h3 className={`text-xl font-display font-bold transition-colors duration-300 ${activeMoon.id === moon.id ? 'text-jupiter-orange' : 'text-white group-hover:text-jupiter-gold'}`}>
                      {moon.name}
                    </h3>
                    {activeMoon.id === moon.id && (
                      <div 
                        className="w-3 h-3 rounded-full bg-jupiter-orange"
                        ref={(el) => {
                          if (el) {
                            gsap.to(el, { 
                              scale: 1.5, 
                              boxShadow: '0 0 20px rgba(255, 107, 53, 0.8)',
                              duration: 1, 
                              repeat: -1, 
                              yoyo: true, 
                              ease: 'power1.inOut' 
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                  
                  {activeMoon.id === moon.id && (
                    <div className="relative z-10 overflow-hidden">
                      <p className="text-gray-300 mb-4 leading-relaxed">{moon.description}</p>
                      <div className="flex gap-6 text-xs text-gray-500 font-mono uppercase tracking-wider">
                        <div className="group/stat">
                          <span className="block text-jupiter-gold font-bold mb-1">Radius</span>
                          <span className="group-hover/stat:text-white transition-colors">{moon.radius}</span>
                        </div>
                        <div className="group/stat">
                          <span className="block text-jupiter-gold font-bold mb-1">Orbital Dist.</span>
                          <span className="group-hover/stat:text-white transition-colors">{moon.distance}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoonGallery;
