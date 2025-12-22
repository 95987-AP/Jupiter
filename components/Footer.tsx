import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#060e18] py-12 border-t border-white/5 overflow-hidden">
      <motion.div 
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-jupiter-orange to-transparent"
        animate={{ 
          x: ['-100%', '100%'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="text-xl font-accent font-bold text-white tracking-wider"
            whileHover={{ scale: 1.05, color: '#FF6B35' }}
          >
            JUPITER
          </motion.span>
          <p className="text-gray-500 text-sm mt-2">The Solar System's Guardian</p>
        </motion.div>
        
        <motion.div 
          className="flex gap-6 text-sm text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.a 
            href="#" 
            className="hover:text-jupiter-orange transition-colors"
            whileHover={{ scale: 1.1, y: -3 }}
          >
            NASA
          </motion.a>
          <motion.a 
            href="#" 
            className="hover:text-jupiter-orange transition-colors"
            whileHover={{ scale: 1.1, y: -3 }}
          >
            ESA
          </motion.a>
          <motion.a 
            href="#" 
            className="hover:text-jupiter-orange transition-colors"
            whileHover={{ scale: 1.1, y: -3 }}
          >
            SpaceX
          </motion.a>
        </motion.div>

        <motion.div 
          className="text-gray-600 text-xs text-center md:text-right"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>&copy; {new Date().getFullYear()} Interactive Jupiter Experience.</p>
          <p className="mt-1">Powered by React Three Fiber & WebGL</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
