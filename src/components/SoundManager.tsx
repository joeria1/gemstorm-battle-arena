
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface Sound {
  id: string;
  src: string;
  volume?: number;
  loop?: boolean;
}

interface SoundContextType {
  playSound: (id: string) => void;
  stopSound: (id: string) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// List of sounds used in the application
const SOUNDS: Sound[] = [
  { id: 'click', src: 'https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3' },
  { id: 'win', src: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3' },
  { id: 'lose', src: 'https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3' },
  { id: 'card', src: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3' },
  { id: 'explosion', src: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-mine-explosion-1184.mp3' },
  { id: 'coins', src: 'https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3' },
  { id: 'slider', src: 'https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-wheel-rolling-1674.mp3' },
  { id: 'tick', src: 'https://assets.mixkit.co/sfx/preview/mixkit-classic-click-1114.mp3' },
];

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  // Initialize audio elements
  useEffect(() => {
    SOUNDS.forEach(sound => {
      const audio = new Audio(sound.src);
      audio.volume = sound.volume ?? 0.5;
      audio.loop = sound.loop ?? false;
      audioRefs.current[sound.id] = audio;
    });

    // Clean up on unmount
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const playSound = (id: string) => {
    if (isMuted) return;
    
    const audio = audioRefs.current[id];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log("Audio play error:", e));
    }
  };

  const stopSound = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const value = {
    playSound,
    stopSound,
    setMuted: setIsMuted,
    isMuted,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
