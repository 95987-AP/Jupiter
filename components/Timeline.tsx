import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MISSIONS } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const Timeline = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animations
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
          once: true,
        }
      });

      gsap.from(dividerRef.current, {
        width: 0,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
          once: true,
        }
      });

      gsap.from(descRef.current, {
        opacity: 0,
        duration: 0.6,
        delay: 0.4,
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
          once: true,
        }
      });

      // Progress line animation
      gsap.to(progressLineRef.current, {
        height: '100%',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 50%',
          end: 'bottom 80%',
          scrub: 1,
        }
      });

      // Timeline items stagger animation
      itemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.from(item, {
            opacity: 0,
            x: index % 2 === 0 ? 50 : -50,
            duration: 0.8,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              once: true,
            }
          });
        }
      });

      // Dots scale animation
      dotsRef.current.forEach((dot, index) => {
        if (dot) {
          gsap.from(dot, {
            scale: 0,
            duration: 0.5,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: dot,
              start: 'top 85%',
              once: true,
            }
          });

          // Pulsing effect
          gsap.to(dot.querySelector('.pulse'), {
            boxShadow: '0 0 30px rgba(255,107,53,1)',
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="science" className="relative z-10 py-32 container mx-auto px-6">
      <div ref={headerRef} className="mb-20 text-center">
        <h2 
          ref={titleRef}
          className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4 tracking-tight leading-extra-tight"
        >
          Exploration History
        </h2>
        <div 
          ref={dividerRef}
          className="h-1 bg-jupiter-orange mx-auto mb-6"
          style={{ width: 96 }}
        />
        <p 
          ref={descRef}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          From Galileo's first telescope to modern autonomous probes, humanity's journey to the Giant.
        </p>
      </div>

      <div className="relative">
        {/* Background Line */}
        <div ref={lineRef} className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent md:-translate-x-1/2 ml-6 md:ml-0" />
        
        {/* Animated Progress Line */}
        <div 
          ref={progressLineRef}
          className="absolute left-0 md:left-1/2 top-0 w-px bg-gradient-to-b from-jupiter-orange via-jupiter-gold to-transparent md:-translate-x-1/2 ml-6 md:ml-0"
          style={{ height: 0 }}
        />

        <div className="space-y-12 md:space-y-24">
          {MISSIONS.map((mission, index) => (
            <div
              key={mission.year}
              className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content Box */}
              <div 
                ref={(el) => (itemsRef.current[index] = el)}
                className="w-full md:w-1/2 pl-16 md:pl-0 md:px-16"
                onMouseEnter={(e) => {
                  const card = e.currentTarget.querySelector('.card');
                  gsap.to(card, { scale: 1.02, x: index % 2 === 0 ? -10 : 10, duration: 0.3 });
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget.querySelector('.card');
                  gsap.to(card, { scale: 1, x: 0, duration: 0.3 });
                }}
              >
                <div className={`card text-left ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} p-6 bg-[#152538]/40 backdrop-blur-sm rounded-lg border border-white/10 hover:border-jupiter-orange/50 transition-all relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-jupiter-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <span className="text-jupiter-orange font-hero text-xl font-bold block mb-2 relative z-10 tracking-wide">
                    {mission.year}
                  </span>
                  
                  <h3 className="text-2xl text-white font-display font-bold mb-3 relative z-10 tracking-tight">
                    {mission.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                    {mission.description}
                  </p>
                </div>
              </div>

              {/* Animated Dot */}
              <div 
                ref={(el) => (dotsRef.current[index] = el)}
                className="absolute left-6 md:left-1/2 -translate-x-1/2"
              >
                <div className="pulse w-5 h-5 bg-jupiter-orange rounded-full shadow-[0_0_20px_rgba(255,107,53,0.8)] border-4 border-[#0B1929] relative">
                  <div 
                    className="absolute inset-0 rounded-full bg-jupiter-orange"
                    ref={(el) => {
                      if (el) {
                        gsap.to(el, {
                          scale: 1.5,
                          opacity: 0,
                          duration: 1,
                          repeat: -1,
                          ease: 'power1.out',
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Empty Space for Grid alignment */}
              <div className="w-full md:w-1/2 hidden md:block"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
