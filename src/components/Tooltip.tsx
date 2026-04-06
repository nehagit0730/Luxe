import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positions = {
    top: '-top-10 left-1/2 -translate-x-1/2',
    bottom: '-bottom-10 left-1/2 -translate-x-1/2',
    left: '-left-20 top-1/2 -translate-y-1/2',
    right: '-right-20 top-1/2 -translate-y-1/2'
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : -5 }}
            className={cn(
              "absolute z-50 px-3 py-1.5 text-[10px] font-bold text-white bg-black rounded-lg whitespace-nowrap shadow-xl pointer-events-none",
              positions[position]
            )}
          >
            {content}
            <div className={cn(
              "absolute w-2 h-2 bg-black rotate-45",
              position === 'top' && "-bottom-1 left-1/2 -translate-x-1/2",
              position === 'bottom' && "-top-1 left-1/2 -translate-x-1/2",
              position === 'left' && "-right-1 top-1/2 -translate-y-1/2",
              position === 'right' && "-left-1 top-1/2 -translate-y-1/2"
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
