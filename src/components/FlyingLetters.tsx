import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const arabicLetters = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";

interface Letter {
  id: number;
  char: string;
  x: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}

export const FlyingLetters: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>([]);

  useEffect(() => {
    // Generate random letters
    const newLetters: Letter[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      char: arabicLetters[Math.floor(Math.random() * arabicLetters.length)],
      x: Math.random() * 100, // percentage
      duration: Math.random() * 10 + 10, // 10s to 20s
      delay: Math.random() * -20, // Start at different times
      size: Math.random() * 2 + 1, // 1rem to 3rem
      opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
    }));
    setLetters(newLetters);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          initial={{ y: '110vh' }}
          animate={{ y: '-10vh', rotate: 360 }}
          transition={{
            y: {
              duration: letter.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: letter.delay,
            },
            rotate: {
              duration: letter.duration * 0.8,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
          className="absolute text-white font-arabic font-bold"
          style={{
            left: `${letter.x}%`,
            fontSize: `${letter.size}rem`,
            opacity: letter.opacity,
            textShadow: '0 0 10px rgba(255,255,255,0.5)',
          }}
        >
          {letter.char}
        </motion.div>
      ))}
    </div>
  );
};
