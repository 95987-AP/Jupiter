import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale, Ruler, Clock, Thermometer } from 'lucide-react';
import { JUPITER_FACTS } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  scale: Scale,
  ruler: Ruler,
  clock: Clock,
  thermometer: Thermometer
};

const InfoCards = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const orbsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Apply parallax to background orbs
  useEffect(() => {
    orbsRef.current.forEach((orb, index) => {
      if (orb) {
        const factor = (index + 1) * 20;
        gsap.to(orb, {
          x: mousePosition.x * factor,
          y: mousePosition.y * factor,
          duration: 1,
          ease: 'power2.out'
        });
      }
    });
  }, [mousePosition]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced background parallax with multiple layers
      gsap.to(bgRef.current, {
        y: '60%',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        }
      });

      // Orbs floating animation
      orbsRef.current.forEach((orb, index) => {
        if (orb) {
          gsap.to(orb, {
            y: `random(-30, 30)`,
            x: `random(-20, 20)`,
            scale: `random(0.9, 1.1)`,
            duration: `random(4, 7)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.5
          });
        }
      });

      // Header animations with enhanced effects
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        filter: 'blur(10px)',
        duration: 0.8,
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
          once: true,
        }
      });

      gsap.from(lineRef.current, {
        width: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
          once: true,
        }
      });

      // Cards stagger animation with 3D effect
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            opacity: 0,
            y: 80,
            rotationX: 15,
            scale: 0.9,
            duration: 0.8,
            delay: index * 0.12,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
            }
          });

          // Continuous subtle floating for each card
          gsap.to(card, {
            y: `random(-5, 5)`,
            duration: `random(3, 5)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.3
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="facts" className="relative z-10 py-32 container mx-auto px-6 overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          ref={(el) => orbsRef.current[0] = el}
          className="absolute top-20 left-10 w-64 h-64 bg-jupiter-orange rounded-full blur-3xl" 
        />
        <div 
          ref={(el) => orbsRef.current[1] = el}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl" 
        />
        <div 
          ref={(el) => orbsRef.current[2] = el}
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-500 rounded-full blur-3xl opacity-50" 
        />
      </div>

      <div ref={headerRef} className="mb-16 text-center relative z-10">
        <h2 
          ref={titleRef}
          className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4 tracking-tight leading-extra-tight"
        >
          Planetary Data
        </h2>
        <div 
          ref={lineRef}
          className="h-1 bg-gradient-to-r from-transparent via-jupiter-orange to-transparent mx-auto"
          style={{ width: 120 }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {JUPITER_FACTS.map((fact, index) => {
          const Icon = iconMap[fact.icon];
          return (
            <div
              key={fact.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className="bg-[#152538]/80 backdrop-blur-md border border-white/10 p-8 rounded-xl hover:border-jupiter-orange/50 transition-all group relative overflow-hidden transform-gpu perspective-1000"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { 
                  y: -15, 
                  scale: 1.03, 
                  boxShadow: '0 25px 50px -12px rgba(255, 107, 53, 0.25)',
                  duration: 0.4,
                  ease: 'back.out(1.7)'
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { 
                  y: 0, 
                  scale: 1, 
                  boxShadow: '0 0 0 0 transparent',
                  duration: 0.4 
                });
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(e.currentTarget, {
                  rotationY: x * 10,
                  rotationX: -y * 10,
                  duration: 0.3
                });
              }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jupiter-orange/10 via-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-jupiter-orange/20 to-purple-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              
              <div 
                className="mb-6 inline-block p-4 bg-jupiter-orange/10 rounded-full group-hover:bg-jupiter-orange/25 transition-all duration-500 relative z-10"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { 
                  rotate: 360, 
                  scale: 1.15, 
                  boxShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
                  duration: 0.6,
                  ease: 'back.out(1.7)'
                })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { 
                  rotate: 0, 
                  scale: 1,
                  boxShadow: '0 0 0 transparent',
                  duration: 0.6 
                })}
              >
                <Icon className="w-8 h-8 text-jupiter-orange group-hover:text-jupiter-gold transition-colors duration-300" />
              </div>
              
              <h3 className="text-jupiter-gold text-sm uppercase tracking-wider font-semibold mb-2 relative z-10">
                {fact.title}
              </h3>
              
              <p className="text-3xl font-display font-bold text-white mb-3 relative z-10 group-hover:text-jupiter-cream transition-colors duration-300">
                {fact.value}
              </p>
              
              <p className="text-gray-400 text-sm leading-relaxed relative z-10 group-hover:text-gray-300 transition-colors duration-300">
                {fact.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InfoCards;
