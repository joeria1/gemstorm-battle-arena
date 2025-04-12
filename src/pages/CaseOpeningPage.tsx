
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { toast } from '@/components/ui/sonner';
import { Package, Gem, Trophy, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { useUser } from '@/context/UserContext';

// Define reward tiers and their probabilities
const REWARD_TIERS = [
  { name: 'Common', color: 'bg-gray-400/30 border-gray-400', value: 0.5, probability: 0.5 },
  { name: 'Uncommon', color: 'bg-blue-500/30 border-blue-500', value: 1, probability: 0.25 },
  { name: 'Rare', color: 'bg-purple-500/30 border-purple-500', value: 2, probability: 0.15 },
  { name: 'Epic', color: 'bg-pink-500/30 border-pink-500', value: 5, probability: 0.07 },
  { name: 'Legendary', color: 'bg-amber-500/30 border-amber-500', value: 10, probability: 0.03 }
];

// Case icons for different case types
const CASE_ICONS = [
  <Package size={24} />,
  <Star size={24} />,
  <Trophy size={24} />,
  <Sparkles size={24} />
];

interface CaseOpeningPageProps {}

const CaseOpeningPage: React.FC<CaseOpeningPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateBalance } = useUser();
  const audioRef = useRef<HTMLAudioElement>(null);
  const tickAudioRef = useRef<HTMLAudioElement>(null);
  const winAudioRef = useRef<HTMLAudioElement>(null);
  
  const [battle] = useState<any>(location.state?.battle || null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinComplete, setSpinComplete] = useState(false);
  const [playerItems, setPlayerItems] = useState<any[]>([]);
  const [opponentItems, setOpponentItems] = useState<any[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [opponentTotal, setOpponentTotal] = useState(0);
  const [winningPlayer, setWinningPlayer] = useState<'player' | 'opponent' | null>(null);
  const [selectedPlayerItem, setSelectedPlayerItem] = useState<number | null>(null);
  const [selectedOpponentItem, setSelectedOpponentItem] = useState<number | null>(null);
  
  // Generate random items based on probabilities
  const generateRandomItems = (count: number, multiplier: number = 1) => {
    const items = [];
    
    // Generate 100 random items for the slider effect
    for (let i = 0; i < 100; i++) {
      const rand = Math.random();
      let cumulativeProbability = 0;
      
      for (const tier of REWARD_TIERS) {
        cumulativeProbability += tier.probability;
        if (rand < cumulativeProbability) {
          const value = tier.value * multiplier * battle?.price;
          items.push({
            ...tier,
            actualValue: Math.floor(value),
            image: `https://picsum.photos/seed/${tier.name}${i}/200/200`
          });
          break;
        }
      }
    }
    
    return items;
  };
  
  // Prepare for spin on mount
  useEffect(() => {
    if (!battle) {
      navigate('/cases');
      return;
    }
    
    // Generate items
    const multiplier = battle.caseType ? (battle.caseType + 1) * 0.2 : 0.2;
    setPlayerItems(generateRandomItems(battle.casesToOpen, multiplier));
    setOpponentItems(generateRandomItems(battle.casesToOpen, multiplier));
    
    // Automatically start spin after a delay
    const timer = setTimeout(() => {
      startSpin();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [battle, navigate]);
  
  const startSpin = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    
    setIsSpinning(true);
    
    // Simulate spinning time
    setTimeout(() => {
      if (tickAudioRef.current) {
        tickAudioRef.current.play();
      }
      
      const playerSelectedIndex = 80; // Fixed position for selected item
      const opponentSelectedIndex = 80;
      
      setSelectedPlayerItem(playerSelectedIndex);
      setSelectedOpponentItem(opponentSelectedIndex);
      
      // Calculate totals
      const playerWinnings = playerItems[playerSelectedIndex].actualValue;
      const opponentWinnings = opponentItems[opponentSelectedIndex].actualValue;
      
      setPlayerTotal(playerWinnings);
      setOpponentTotal(opponentWinnings);
      
      // Determine winner
      setTimeout(() => {
        setSpinComplete(true);
        if (winAudioRef.current) {
          winAudioRef.current.play();
        }
        
        if (playerWinnings > opponentWinnings) {
          setWinningPlayer('player');
          updateBalance(battle.price * battle.maxPlayers * 0.9);
          toast.success(`You won ${battle.price * battle.maxPlayers * 0.9} gems!`);
        } else if (opponentWinnings > playerWinnings) {
          setWinningPlayer('opponent');
          toast('Better luck next time!');
        } else {
          // It's a tie, split the pot
          setWinningPlayer(null);
          updateBalance(battle.price);
          toast.info('It\'s a tie! Your bet has been returned.');
        }
      }, 1000);
      
    }, 5000); // 5 seconds of spinning
  };
  
  const renderCaseImage = (caseType: number) => {
    return (
      <div className="relative flex items-center justify-center bg-primary/10 p-4 rounded-lg">
        {CASE_ICONS[caseType % CASE_ICONS.length]}
        <img 
          src={`https://picsum.photos/seed/case${caseType}/200/200`}
          alt="Case"
          className="w-20 h-20 object-contain filter drop-shadow-lg"
        />
      </div>
    );
  };

  if (!battle) {
    return null;
  }

  return (
    <div className="container py-8 relative">
      <Button 
        variant="outline" 
        className="mb-8"
        onClick={() => navigate('/cases')}
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Case Battles
      </Button>
      
      <h1 className="text-3xl font-bold text-center mb-2">{battle.name}</h1>
      <p className="text-muted-foreground text-center mb-8">Battle is in progress!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Player side */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                {user?.username?.substring(0, 1) || 'Y'}
              </div>
              <h3 className="font-medium">You</h3>
            </div>
            
            <div className="flex items-center gap-1">
              <Gem className="w-4 h-4 text-gem" />
              <span className={`font-medium ${winningPlayer === 'player' ? 'text-green-500' : ''}`}>
                {playerTotal}
              </span>
            </div>
          </div>
          
          <div className="relative overflow-hidden border border-border rounded-lg bg-card">
            <div className="flex items-center justify-center p-4">
              {renderCaseImage(battle.caseType || 0)}
            </div>
            
            <div className="relative h-32 overflow-hidden">
              <div className="absolute left-0 right-0 top-14 h-4 bg-primary/50 z-10"></div>
              
              <div 
                className={`flex transition-transform duration-5000 ease-out`}
                style={{
                  transform: isSpinning ? `translateX(calc(-${selectedPlayerItem || 0}00% + 50%))` : 'translateX(0)',
                }}
              >
                {playerItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-full h-32 flex items-center justify-center border-r border-border ${item.color}`}
                  >
                    <div className="text-center">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-contain mx-auto rounded"
                      />
                      <div className="mt-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex items-center justify-center gap-1">
                          <Gem className="w-3 h-3 text-gem" />
                          <span className="text-gem">{item.actualValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Opponent side */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                O
              </div>
              <h3 className="font-medium">Opponent</h3>
            </div>
            
            <div className="flex items-center gap-1">
              <Gem className="w-4 h-4 text-gem" />
              <span className={`font-medium ${winningPlayer === 'opponent' ? 'text-green-500' : ''}`}>
                {opponentTotal}
              </span>
            </div>
          </div>
          
          <div className="relative overflow-hidden border border-border rounded-lg bg-card">
            <div className="flex items-center justify-center p-4">
              {renderCaseImage(battle.caseType || 0)}
            </div>
            
            <div className="relative h-32 overflow-hidden">
              <div className="absolute left-0 right-0 top-14 h-4 bg-primary/50 z-10"></div>
              
              <div 
                className={`flex transition-transform duration-5000 ease-out`}
                style={{
                  transform: isSpinning ? `translateX(calc(-${selectedOpponentItem || 0}00% + 50%))` : 'translateX(0)',
                }}
              >
                {opponentItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 w-full h-32 flex items-center justify-center border-r border-border ${item.color}`}
                  >
                    <div className="text-center">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-contain mx-auto rounded"
                      />
                      <div className="mt-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex items-center justify-center gap-1">
                          <Gem className="w-3 h-3 text-gem" />
                          <span className="text-gem">{item.actualValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {spinComplete && (
        <div className={`mt-8 p-6 rounded-xl animate-scale-in text-center ${
          winningPlayer === 'player' ? 'bg-green-500/20' : 
          winningPlayer === 'opponent' ? 'bg-red-500/20' : 
          'bg-amber-500/20'
        }`}>
          <h3 className="text-2xl font-bold mb-2">
            {winningPlayer === 'player' ? 'You Won!' : 
             winningPlayer === 'opponent' ? 'You Lost!' : 
             'It\'s a Tie!'}
          </h3>
          
          {winningPlayer === 'player' && (
            <div className="flex items-center justify-center gap-2 text-xl">
              <Gem className="h-5 w-5 text-gem animate-pulse" />
              <span className="text-2xl font-bold text-gem">{battle.price * battle.maxPlayers * 0.9}</span>
            </div>
          )}
          
          <Button 
            className="mt-4 bg-game-cases hover:bg-game-cases/90"
            onClick={() => navigate('/cases')}
          >
            Back to Battles
          </Button>
        </div>
      )}
      
      {/* Audio elements */}
      <audio ref={audioRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-wheel-rolling-1674.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={tickAudioRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-classic-click-1114.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={winAudioRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default CaseOpeningPage;
