import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedInputProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export function AnimatedInput({ 
  id, 
  type, 
  placeholder, 
  value, 
  onChange, 
  className = "", 
  required = false 
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Brief typing animation
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 150);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Echtes Input */}
      <motion.input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`relative z-10 w-full h-10 px-3 py-2 border rounded-md transition-all duration-200 ${className}`}
        required={required}
        animate={{
          scale: isTyping ? 1.01 : 1,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Subtle Glow Effect beim Fokus */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 rounded-md pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, rgba(74, 222, 128, 0.05), rgba(74, 222, 128, 0.1))',
              boxShadow: '0 0 0 1px rgba(74, 222, 128, 0.2), 0 0 8px rgba(74, 222, 128, 0.15)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Typing Particle Effect */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.5, 1, 0.5],
              x: [0, 10, 20]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-2 right-3 w-1 h-1 bg-primary rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Subtle Border Animation beim Fokus */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            <svg className="w-full h-full absolute inset-0" style={{ borderRadius: '0.375rem' }}>
              <motion.rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="5"
                fill="none"
                stroke="rgba(74, 222, 128, 0.4)"
                strokeWidth="1"
                strokeDasharray="2 4"
                initial={{ pathLength: 0, rotate: 0 }}
                animate={{ 
                  pathLength: 1,
                  rotate: 360
                }}
                transition={{ 
                  pathLength: { duration: 0.5 },
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}