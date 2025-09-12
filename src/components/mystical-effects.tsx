import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface MysticalEffectsProps {
  showParticles?: boolean;
  showBubbles?: boolean;
  showFog?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function MysticalEffects({ 
  showParticles = true, 
  showBubbles = true, 
  showFog = true,
  intensity = 'medium'
}: MysticalEffectsProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const particleCount = intensity === 'low' ? 5 : intensity === 'medium' ? 10 : 15;
    const bubbleCount = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 8;

    // Generate particles
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 4,
    }));
    setParticles(newParticles);

    // Generate bubbles
    const newBubbles = Array.from({ length: bubbleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 3,
    }));
    setBubbles(newBubbles);
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Particles */}
      {showParticles && particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute w-1 h-1 bg-primary rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 4px rgba(34, 197, 94, 0.8)',
          }}
          animate={{
            y: [window.innerHeight + 20, -20],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Poison Bubbles */}
      {showBubbles && bubbles.map((bubble) => (
        <motion.div
          key={`bubble-${bubble.id}`}
          className="absolute rounded-full"
          style={{
            left: `${bubble.x}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: `radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 70%, transparent 100%)`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [window.innerHeight + bubble.size, -bubble.size],
            scale: [0.5, 1, 0.8, 1.2, 0],
            opacity: [0, 0.8, 1, 0.6, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Mystical Fog */}
      {showFog && (
        <>
          <motion.div
            className="absolute bottom-0 left-0 w-full h-32"
            style={{
              background: 'linear-gradient(to top, rgba(34, 197, 94, 0.08) 0%, transparent 100%)',
              filter: 'blur(20px)',
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-full h-24"
            style={{
              background: 'linear-gradient(to top, rgba(34, 197, 94, 0.05) 0%, transparent 100%)',
              filter: 'blur(15px)',
            }}
            animate={{
              x: ['100%', '-100%'],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 5,
            }}
          />
        </>
      )}

      {/* Magical Sparkles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.9) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(0.5px)',
        }}
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute top-3/4 right-1/3 w-1 h-1"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(0.3px)',
        }}
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 4,
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/4 w-1.5 h-1.5"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.7) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(0.4px)',
        }}
        animate={{
          scale: [0, 1, 0],
          y: [0, -20, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 6,
        }}
      />
    </div>
  );
}

export function PoisonDripEffect() {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 bg-primary rounded-full"
          style={{
            left: `${-4 + i * 4}px`,
            height: '20px',
            background: 'linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 0.2))',
            filter: 'blur(0.5px)',
          }}
          animate={{
            height: ['10px', '25px', '15px'],
            opacity: [0.4, 1, 0.6],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface CauldronBubbleProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export function CauldronBubble({ size = 'medium', color = 'rgba(34, 197, 94, 0.3)' }: CauldronBubbleProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full cauldron-bubble`}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        border: `1px solid ${color.replace('0.3', '0.6')}`,
        filter: 'blur(1px)',
      }}
      whileHover={{
        scale: 1.2,
        filter: 'blur(0.5px)',
      }}
    />
  );
}