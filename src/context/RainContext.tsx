
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Rain } from '../types';
import { useUser } from './UserContext';
import { toast } from "@/components/ui/sonner";

interface RainContextType {
  currentRain: Rain | null;
  joinRain: () => void;
  participatingUsers: string[];
  isParticipating: boolean;
  showRainAnimation: boolean;
}

const RainContext = createContext<RainContextType | undefined>(undefined);

export const RainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRain, setCurrentRain] = useState<Rain | null>(null);
  const [participatingUsers, setParticipatingUsers] = useState<string[]>([]);
  const [showRainAnimation, setShowRainAnimation] = useState(false);
  const { user, updateBalance } = useUser();

  const isParticipating = user ? participatingUsers.includes(user.id) : false;

  // Initialize a new rain
  useEffect(() => {
    const initRain = () => {
      const rain: Rain = {
        id: `rain_${Date.now()}`,
        totalAmount: 5000, // 5000 gems
        participantsCount: 0,
        distributedAt: null,
        status: 'pending',
        timeRemaining: 30 * 60, // 30 minutes in seconds
      };
      setCurrentRain(rain);
      setParticipatingUsers([]);
    };

    // Start immediately
    initRain();

    // Set up a timer to create new rain every 30 minutes
    const interval = setInterval(() => {
      initRain();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  // Count down timer and distribute rain
  useEffect(() => {
    if (!currentRain) return;

    const timerInterval = setInterval(() => {
      if (currentRain.timeRemaining <= 0) {
        // Time to distribute the rain
        distributeRain();
        clearInterval(timerInterval);
      } else {
        setCurrentRain(prev => {
          if (!prev) return null;
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [currentRain]);

  const distributeRain = () => {
    if (!currentRain || participatingUsers.length === 0) return;

    setCurrentRain(prev => {
      if (!prev) return null;
      return { ...prev, status: 'active' };
    });

    // Display rain animation for 3 seconds
    setShowRainAnimation(true);
    setTimeout(() => {
      setShowRainAnimation(false);

      // Calculate gem amount per participant
      const amountPerUser = Math.floor(currentRain.totalAmount / participatingUsers.length);
      
      // Update user balance if they're participating
      if (user && isParticipating) {
        updateBalance(amountPerUser);
        toast.success(
          `Rain completed!`, 
          { description: `You received ${amountPerUser} gems from the rain.` }
        );
      }

      setCurrentRain(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          status: 'completed', 
          distributedAt: new Date(),
          participantsCount: participatingUsers.length,
        };
      });
    }, 3000);
  };

  const joinRain = () => {
    if (!user || !currentRain || currentRain.status !== 'pending' || isParticipating) return;

    setParticipatingUsers(prev => [...prev, user.id]);
    toast("You've joined the rain! Wait for distribution.");
  };

  return (
    <RainContext.Provider value={{ 
      currentRain, 
      joinRain, 
      participatingUsers, 
      isParticipating,
      showRainAnimation
    }}>
      {children}
    </RainContext.Provider>
  );
};

export const useRain = (): RainContextType => {
  const context = useContext(RainContext);
  if (context === undefined) {
    throw new Error('useRain must be used within a RainProvider');
  }
  return context;
};
