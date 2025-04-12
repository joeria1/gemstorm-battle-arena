
import React, { useEffect, useState } from 'react';
import { Cloud, Gem } from 'lucide-react';
import { Button } from './ui/button';
import { useRain } from '@/context/RainContext';
import { useUser } from '@/context/UserContext';
import { Progress } from './ui/progress';

const RainTimer: React.FC = () => {
  const { currentRain, joinRain, isParticipating, participatingUsers } = useRain();
  const { user } = useUser();
  const [timeDisplay, setTimeDisplay] = useState('');
  
  useEffect(() => {
    if (!currentRain) return;
    
    const updateTime = () => {
      const minutes = Math.floor(currentRain.timeRemaining / 60);
      const seconds = currentRain.timeRemaining % 60;
      setTimeDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTime();
    
  }, [currentRain]);

  if (!currentRain) return null;

  const percentRemaining = (currentRain.timeRemaining / (30 * 60)) * 100;
  
  return (
    <div className="fixed bottom-4 right-4 bg-card rounded-lg border border-border shadow-lg overflow-hidden w-72 z-30">
      <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
        <Cloud className="h-5 w-5 text-primary" />
        <span className="font-semibold">Gem Rain</span>
        <span className="ml-auto text-sm">{participatingUsers.length} users</span>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gem className="h-4 w-4 text-gem" />
            <span className="gem-text">{currentRain.totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="text-sm font-mono bg-background/50 px-2.5 py-1 rounded">
            {timeDisplay}
          </div>
        </div>
        
        <Progress value={percentRemaining} className="h-1" />
        
        <div className="pt-1">
          {user ? (
            isParticipating ? (
              <Button disabled className="w-full bg-primary/50">
                Joined
              </Button>
            ) : (
              <Button onClick={joinRain} className="w-full">
                Join Rain
              </Button>
            )
          ) : (
            <Button disabled className="w-full bg-muted/50">
              Login to Join
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RainTimer;
