import React, { useState, useEffect } from 'react';
import { JUPITER_MOONS } from '../constants';

const MoonIndicator: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'jupiter', name: 'Jupiter', color: '#F4A460', scrollPos: 0 },
    { id: 'io', name: 'Io', color: '#F4D03F', scrollPos: 0.25 },
    { id: 'europa', name: 'Europa', color: '#87CEEB', scrollPos: 0.40 },
    { id: 'ganymede', name: 'Ganymede', color: '#AAB7B8', scrollPos: 0.55 },
    { id: 'callisto', name: 'Callisto', color: '#8B7355', scrollPos: 0.70 },
  ];

  // Determine current section
  const getCurrentSection = () => {
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollProgress >= sections[i].scrollPos - 0.05) {
        return i;
      }
    }
    return 0;
  };

  const currentSectionIndex = getCurrentSection();

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 
                    flex flex-col items-center gap-3">
      {sections.map((section, index) => {
        const isActive = index === currentSectionIndex;
        const isPast = scrollProgress >= section.scrollPos;
        
        return (
          <div 
            key={section.id}
            className="group relative flex items-center"
          >
            {/* Connection line */}
            {index < sections.length - 1 && (
              <div 
                className="absolute left-1/2 top-full w-0.5 h-3 -translate-x-1/2
                          transition-colors duration-500"
                style={{ 
                  backgroundColor: isPast ? section.color : 'rgba(255,255,255,0.2)'
                }}
              />
            )}
            
            {/* Indicator dot */}
            <button
              onClick={() => {
                const targetScroll = section.scrollPos * (document.documentElement.scrollHeight - window.innerHeight);
                window.scrollTo({
                  top: targetScroll,
                  behavior: 'smooth'
                });
              }}
              className={`
                relative w-3 h-3 rounded-full transition-all duration-500 cursor-pointer
                hover:scale-150
                ${isActive 
                  ? 'scale-150 ring-2 ring-offset-2 ring-offset-[#0B1929]' 
                  : isPast ? 'scale-100' : 'scale-75 opacity-50'
                }
              `}
              style={{ 
                backgroundColor: isActive || isPast ? section.color : 'rgba(255,255,255,0.3)',
                boxShadow: isActive ? `0 0 20px ${section.color}80, 0 0 0 2px ${section.color}` : 'none'
              }}
              aria-label={`Navigate to ${section.name}`}
            />
            
            {/* Label tooltip */}
            <div 
              className={`
                absolute right-8 whitespace-nowrap px-3 py-1.5 rounded-lg
                text-sm font-medium transition-all duration-300
                ${isActive 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0'
                }
              `}
              style={{ 
                backgroundColor: `${section.color}20`,
                border: `1px solid ${section.color}40`,
                color: section.color
              }}
            >
              {section.name}
            </div>
          </div>
        );
      })}
      
      {/* Scroll progress line */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 -z-10 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="w-full bg-gradient-to-b from-jupiter-orange to-purple-500 transition-all duration-300"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
};

export default MoonIndicator;
