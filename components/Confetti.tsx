'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfettiPiece {
  id: number;
  color: string;
  size: number;
  isCircle: boolean;
  startX: number;
  dx: number;
  rot: number;
  duration: number;
  delay: number;
  heightMult: number;
}

interface ConfettiContextType {
  launchConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const launchConfetti = () => {
    const colors = ['#FF6A00', '#FF9A3D', '#FFB547', '#FF6F5B', '#FFFFFF', '#2F8A4A'];
    const count = 75;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: Math.random() + i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        isCircle: Math.random() <= 0.3,
        startX: Math.random() * windowWidth,
        dx: (Math.random() - 0.5) * 350,
        rot: (Math.random() - 0.5) * 720,
        duration: Math.random() * 2 + 1.8,
        delay: Math.random() * 0.4,
        heightMult: Math.random() > 0.5 ? 1 : 1.6
      });
    }

    setPieces(newPieces);
    setTimeout(() => {
      setPieces([]);
    }, 4000);
  };

  return (
    <ConfettiContext.Provider value={{ launchConfetti }}>
      {children}
      {pieces.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99999,
            overflow: 'hidden'
          }}
        >
          {pieces.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.startX}px`,
                top: '-20px',
                width: `${p.size}px`,
                height: `${p.size * p.heightMult}px`,
                background: p.color,
                borderRadius: p.isCircle ? '50%' : '2px',
                opacity: 1,
                // @ts-expect-error CSS variable custom properties
                '--dx': `${p.dx}px`,
                '--rot': `${p.rot}deg`,
                animation: `confetti ${p.duration}s cubic-bezier(.25,.46,.45,.94) ${p.delay}s forwards`
              }}
            />
          ))}
        </div>
      )}
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
}
