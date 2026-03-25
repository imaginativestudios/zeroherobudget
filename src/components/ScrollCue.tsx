import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollCueProps {
  targetId: string;
}

export function ScrollCue({ targetId }: ScrollCueProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToNext = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.button
      onClick={scrollToNext}
      aria-label="Scroll to explore"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, delay: 1.2 }}
      className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer z-10 pointer-events-auto"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <span className="text-xs sm:text-sm text-white/70">Scroll to explore</span>
      <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-white/80" />
        </motion.div>
      </div>
    </motion.button>
  );
}
