
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Card, ChevronsDown, ChevronsUp, Gem, Play, RefreshCw } from 'lucide-react';

// Card suits: spades (♠), hearts (♥), diamonds (♦), clubs (♣)
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface PlayingCard {
  suit: string;
  value: string;
  numericValue: number;
}

const Blackjack: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [betAmount, setBetAmount] = useState(100);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer-turn' | 'complete'>('betting');
  const [result, setResult] = useState<'pending' | 'player-blackjack' | 'player-win' | 'dealer-win' | 'push'>('pending');

  // Calculate hand value
  const calculateHandValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aceCount = 0;
    
    for (const card of hand) {
      if (card.value === 'A') {
        aceCount++;
        value += 11;
      } else {
        value += card.numericValue;
      }
    }
    
    // Adjust for aces
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }
    
    return value;
  };

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  // Create a fresh shuffled deck
  const createDeck = (): PlayingCard[] => {
    const newDeck: PlayingCard[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        let numericValue: number;
        
        if (value === 'A') {
          numericValue = 11;
        } else if (['J', 'Q', 'K'].includes(value)) {
          numericValue = 10;
        } else {
          numericValue = parseInt(value);
        }
        
        newDeck.push({ suit, value, numericValue });
      }
    }
    
    // Shuffle the deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    return newDeck;
  };

  // Draw card from the deck
  const drawCard = (): PlayingCard => {
    const card = deck[0];
    setDeck(deck.slice(1));
    return card;
  };

  // Start a new game
  const startGame = () => {
    if (!user) {
      toast.error('Please login to play');
      return;
    }
    
    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    
    if (user.balance < betAmount) {
      toast.error('Insufficient balance');
      return;
    }
    
    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Create a fresh deck
    const newDeck = createDeck();
    setDeck(newDeck);
    
    // Draw initial cards
    const playerCard1 = newDeck[0];
    const dealerCard1 = newDeck[1];
    const playerCard2 = newDeck[2];
    const dealerCard2 = newDeck[3];
    
    const initialPlayerHand = [playerCard1, playerCard2];
    const initialDealerHand = [dealerCard1, dealerCard2];
    
    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);
    setDeck(newDeck.slice(4));
    setGameState('playing');
    setResult('pending');
    
    // Check for blackjack
    const playerValue = calculateHandValue(initialPlayerHand);
    const dealerValue = calculateHandValue(initialDealerHand);
    
    if (playerValue === 21) {
      if (dealerValue === 21) {
        // Both have blackjack, it's a push
        handleGameEnd('push');
      } else {
        // Player has blackjack, pays 3:2
        handleGameEnd('player-blackjack');
      }
    }
  };

  // Player hits (draws another card)
  const playerHit = () => {
    if (gameState !== 'playing') return;
    
    const card = drawCard();
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    
    // Check for bust
    const value = calculateHandValue(newHand);
    if (value > 21) {
      handleGameEnd('dealer-win');
    }
  };

  // Player stands (dealer's turn)
  const playerStand = () => {
    if (gameState !== 'playing') return;
    
    setGameState('dealer-turn');
    
    // Dealer draws cards until they have 17 or more
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    let dealerHandValue = calculateHandValue(currentDealerHand);
    
    const dealerPlay = () => {
      if (dealerHandValue < 17) {
        // Dealer draws a card
        const card = currentDeck[0];
        currentDealerHand = [...currentDealerHand, card];
        currentDeck = currentDeck.slice(1);
        
        // Update state
        setDealerHand(currentDealerHand);
        setDeck(currentDeck);
        
        dealerHandValue = calculateHandValue(currentDealerHand);
        
        // Continue dealer's turn after a delay
        setTimeout(dealerPlay, 800);
      } else {
        // Dealer is done drawing, determine the winner
        determineWinner(calculateHandValue(playerHand), dealerHandValue);
      }
    };
    
    // Start dealer's turn
    setTimeout(dealerPlay, 800);
  };

  // Determine the winner
  const determineWinner = (playerValue: number, dealerValue: number) => {
    if (dealerValue > 21) {
      // Dealer busts, player wins
      handleGameEnd('player-win');
    } else if (playerValue > dealerValue) {
      // Player has higher value, player wins
      handleGameEnd('player-win');
    } else if (dealerValue > playerValue) {
      // Dealer has higher value, dealer wins
      handleGameEnd('dealer-win');
    } else {
      // Equal values, it's a push
      handleGameEnd('push');
    }
  };

  // Handle game end and payout
  const handleGameEnd = (gameResult: 'player-blackjack' | 'player-win' | 'dealer-win' | 'push') => {
    setGameState('complete');
    setResult(gameResult);
    
    let payout = 0;
    
    switch (gameResult) {
      case 'player-blackjack':
        // Blackjack usually pays 3:2
        payout = betAmount * 2.5;
        toast.success('Blackjack! You win!', {
          description: `You won ${payout} gems!`
        });
        break;
        
      case 'player-win':
        // Regular win pays 1:1
        payout = betAmount * 2;
        toast.success('You win!', {
          description: `You won ${payout} gems!`
        });
        break;
        
      case 'push':
        // Push returns the original bet
        payout = betAmount;
        toast('Push! Your bet is returned.');
        break;
        
      case 'dealer-win':
        // No payout on loss
        toast('Dealer wins. Better luck next time!');
        break;
    }
    
    if (payout > 0) {
      updateBalance(payout);
    }
  };

  // Reset the game
  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
    setGameState('betting');
    setResult('pending');
  };

  // Render a card
  const renderCard = (card: PlayingCard | null, isHidden = false) => {
    if (!card) return null;
    
    const isSuitRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <div className={`
        relative w-16 h-24 rounded-md flex items-center justify-center
        ${isHidden ? 'bg-primary/20 border-2 border-primary/30' : 'bg-white'} shadow-md
      `}>
        {!isHidden ? (
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${isSuitRed ? 'text-red-500' : 'text-black'}`}>
              {card.value}
            </span>
            <span className={`text-2xl ${isSuitRed ? 'text-red-500' : 'text-black'}`}>
              {card.suit}
            </span>
          </div>
        ) : (
          <div className="w-10 h-14 bg-primary/30 rounded"></div>
        )}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Blackjack</h1>
          <p className="text-muted-foreground">Beat the dealer without going over 21</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game controls */}
          <div className="col-span-1 bg-card rounded-xl border border-border p-6 space-y-6">
            {gameState === 'betting' ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Bet Amount</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                      min={10}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setBetAmount(prev => Math.max(10, prev * 2))}
                    >
                      2x
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 200, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(amount)}
                        className="text-xs"
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={startGame}
                  disabled={!user || user.balance < betAmount}
                  className="w-full bg-game-blackjack hover:bg-game-blackjack/90"
                >
                  <Play className="mr-2 h-4 w-4" /> Deal Cards
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Current Bet</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Gem className="h-5 w-5 text-gem" />
                    <span className="text-2xl font-bold gem-text">
                      {betAmount}
                    </span>
                  </div>
                </div>
                
                {gameState === 'playing' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={playerHit}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <ChevronsUp className="mr-2 h-4 w-4" /> Hit
                    </Button>
                    <Button 
                      onClick={playerStand}
                      variant="secondary"
                    >
                      <ChevronsDown className="mr-2 h-4 w-4" /> Stand
                    </Button>
                  </div>
                )}
                
                {gameState === 'complete' && (
                  <div>
                    {result === 'player-blackjack' && (
                      <div className="bg-green-500/20 border border-green-500/30 p-3 rounded-lg text-center mb-4">
                        <h3 className="font-semibold">Blackjack!</h3>
                        <p className="text-sm">You won {(betAmount * 2.5).toFixed(0)} gems</p>
                      </div>
                    )}
                    {result === 'player-win' && (
                      <div className="bg-green-500/20 border border-green-500/30 p-3 rounded-lg text-center mb-4">
                        <h3 className="font-semibold">You Win!</h3>
                        <p className="text-sm">You won {betAmount * 2} gems</p>
                      </div>
                    )}
                    {result === 'dealer-win' && (
                      <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg text-center mb-4">
                        <h3 className="font-semibold">Dealer Wins</h3>
                        <p className="text-sm">Better luck next time!</p>
                      </div>
                    )}
                    {result === 'push' && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg text-center mb-4">
                        <h3 className="font-semibold">Push</h3>
                        <p className="text-sm">Your {betAmount} gems bet is returned</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={resetGame}
                      className="w-full"
                      variant="outline"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Play Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Game table */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-green-900 rounded-xl border border-green-800 p-6 h-full flex flex-col">
              {/* Dealer's hand */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Dealer's Hand</h3>
                  {dealerHand.length > 0 && gameState !== 'betting' && (
                    <div className="px-3 py-1 bg-black/30 rounded-full text-sm">
                      {gameState === 'playing' ? '?' : dealerValue}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {dealerHand.map((card, index) => (
                    <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      {renderCard(card, index === 1 && gameState === 'playing')}
                    </div>
                  ))}
                  {dealerHand.length === 0 && gameState === 'betting' && (
                    <div className="flex items-center justify-center border-2 border-dashed border-white/20 rounded-md w-16 h-24">
                      <Card className="text-white/30" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Player's hand */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Your Hand</h3>
                  {playerHand.length > 0 && gameState !== 'betting' && (
                    <div className="px-3 py-1 bg-black/30 rounded-full text-sm">
                      {playerValue}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {playerHand.map((card, index) => (
                    <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      {renderCard(card)}
                    </div>
                  ))}
                  {playerHand.length === 0 && gameState === 'betting' && (
                    <div className="flex items-center justify-center border-2 border-dashed border-white/20 rounded-md w-16 h-24">
                      <Card className="text-white/30" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
