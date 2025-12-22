import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Discoveries', href: '#facts' },
    { name: 'Moons', href: '#moons' },
    { name: 'Science', href: '#science' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0B1929]/90 backdrop-blur-md py-4 shadow-lg shadow-jupiter-orange/10' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <motion.div 
          className="text-2xl font-accent font-bold tracking-wider text-jupiter-orange"
          whileHover={{ scale: 1.05, textShadow: "0 0 20px rgba(255,107,53,0.8)" }}
          transition={{ duration: 0.3 }}
        >
          JUPITER
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              whileHover={{ 
                scale: 1.1, 
                color: '#F7931E',
                textShadow: "0 0 10px rgba(247,147,30,0.5)"
              }}
              className="text-sm uppercase tracking-widest text-jupiter-cream hover:text-jupiter-gold transition-colors relative group"
            >
              {link.name}
              <motion.span 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jupiter-orange group-hover:w-full transition-all duration-300"
              />
            </motion.a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <motion.button
          className="md:hidden text-jupiter-cream"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9, rotate: 90 }}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full left-0 w-full bg-[#0B1929]/95 backdrop-blur-lg border-t border-white/10 overflow-hidden shadow-2xl shadow-jupiter-orange/20"
          >
            <div className="p-6 flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-lg font-display font-medium text-center text-jupiter-cream py-2 hover:text-jupiter-orange transition-colors tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
