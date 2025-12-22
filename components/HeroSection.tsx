import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Apply mouse parallax to content
  useEffect(() => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        x: mousePosition.x * 15,
        y: mousePosition.y * 10,
        duration: 0.8,
        ease: 'power2.out'
      });
    }
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: mousePosition.x * 40,
        y: mousePosition.y * 30,
        duration: 1.2,
        ease: 'power2.out'
      });
    }
  }, [mousePosition]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced scroll parallax with 3D effect
      gsap.to(sectionRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 150,
        rotationX: 10,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      });

      // Separate parallax for title with different speed
      gsap.to(titleRef.current, {
        y: -80,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        }
      });

      // Initial load animations with enhanced effects
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      
      // Animated glow
      tl.fromTo(glowRef.current, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: 'elastic.out(1, 0.5)' }
      );
      
      // Subtitle with typewriter-like effect
      tl.from(subtitleRef.current, { 
        opacity: 0, 
        y: 30, 
        filter: 'blur(10px)',
        duration: 1.2, 
        delay: 0.3 
      }, '-=1.5');
      
      // Title with dramatic scale
      tl.from(titleRef.current, { 
        opacity: 0, 
        scale: 0.5, 
        y: 50,
        filter: 'blur(20px)',
        duration: 1.4
      }, '-=0.9');
      
      // Description fade
      tl.from(descRef.current, { 
        opacity: 0, 
        y: 30,
        duration: 1 
      }, '-=0.8');
      
      // CTA button with bounce
      tl.from(ctaRef.current, { 
        opacity: 0, 
        y: 40, 
        scale: 0.8,
        duration: 0.8, 
        ease: 'back.out(1.7)' 
      }, '-=0.6');

      // Continuous glow animation
      gsap.to(glowRef.current, {
        scale: 1.1,
        opacity: 0.8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Floating particles animation
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        Array.from(particles).forEach((particle, i) => {
          gsap.to(particle, {
            y: `random(-100, 100)`,
            x: `random(-50, 50)`,
            opacity: `random(0.3, 0.8)`,
            duration: `random(3, 6)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center justify-center text-center px-4 z-10 pointer-events-none perspective-1000"
    >
      {/* Animated glow background */}
      <div 
        ref={glowRef}
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-radial from-jupiter-orange/30 via-purple-600/20 to-transparent blur-3xl pointer-events-none"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      
      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-jupiter-gold/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div ref={contentRef} className="pointer-events-auto relative">
        <span 
          ref={subtitleRef}
          className="text-jupiter-gold tracking-[0.4em] uppercase text-sm md:text-base font-semibold mb-6 block animate-pulse-slow"
        >
          The Solar System's Giant
        </span>
        
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-jupiter-cream to-jupiter-gold/70 mb-8 drop-shadow-2xl relative"
        >
          <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-jupiter-orange/50 to-transparent blur-xl">
            JUPITER
          </span>
          JUPITER
        </h1>
        
        <p 
          ref={descRef}
          className="max-w-xl mx-auto text-jupiter-cream/80 text-lg md:text-xl leading-relaxed mb-12"
        >
          Explore the king of planets. A gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined.
        </p>
        
        <a 
          ref={ctaRef}
          href="#facts"
          className="group inline-block px-10 py-4 border-2 border-jupiter-orange text-jupiter-orange hover:bg-jupiter-orange hover:text-white transition-all duration-500 rounded-sm font-display tracking-widest uppercase text-sm relative overflow-hidden"
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, { scale: 1.08, duration: 0.3, ease: 'back.out(1.7)' });
            gsap.to(e.currentTarget.querySelector('.btn-glow'), { opacity: 1, scale: 1.5, duration: 0.4 });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, { scale: 1, duration: 0.3 });
            gsap.to(e.currentTarget.querySelector('.btn-glow'), { opacity: 0, scale: 1, duration: 0.4 });
          }}
        >
          <span className="btn-glow absolute inset-0 bg-jupiter-orange/20 rounded-full blur-xl opacity-0 transition-all" />
          <span className="relative z-10">Begin Exploration</span>
        </a>
      </div>

      <div className="absolute bottom-10">
        <ChevronDown className="w-8 h-8 text-jupiter-gold opacity-70 animate-bounce" />
      </div>
    </section>
  );
};

export default HeroSection;
