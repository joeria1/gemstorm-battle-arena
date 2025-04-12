
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/sonner';
import { Bomb, Check, Gem, RefreshCw } from 'lucide-react';

const Mines: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [betAmount, setBetAmount] = useState(100);
  const [minesCount, setMinesCount] = useState(3);
  const [isGameActive, setIsGameActive] = useState(false);
  const [grid, setGrid] = useState<Array<{ revealed: boolean; isMine: boolean; value: number }>>(
    Array(25).fill(null).map(() => ({ revealed: false, isMine: false, value: 0 }))
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [nextCellMultiplier, setNextCellMultiplier] = useState(0);
  const [gameResult, setGameResult] = useState<'pending' | 'win' | 'lose'>('pending');
  const [canCashout, setCanCashout] = useState(false);

  // Calculate multipliers based on mines count and revealed cells
  useEffect(() => {
    if (!isGameActive) return;
    
    const calcMultiplier = (mines: number, revealed: number) => {
      // This is a simplified formula. In a real app, it would be more precise
      const safeSquares = 25 - mines;
      let multi = 0.95 * (25 / (safeSquares - revealed)); // 95% return rate
      return Math.max(multi, 1);
    };
    
    const multiplier = calcMultiplier(minesCount, revealedCount);
    setPotentialWin(Math.floor(betAmount * multiplier));
    
    const nextMulti = calcMultiplier(minesCount, revealedCount + 1);
    setNextCellMultiplier(nextMulti);
    
    // Enable cashout after revealing at least one cell
    setCanCashout(revealedCount > 0);
    
  }, [minesCount, revealedCount, betAmount, isGameActive]);

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
    
    // Generate mine positions
    const minePositions = new Set<number>();
    while (minePositions.size < minesCount) {
      minePositions.add(Math.floor(Math.random() * 25));
    }
    
    // Setup grid
    const newGrid = Array(25).fill(null).map((_, index) => ({
      revealed: false,
      isMine: minePositions.has(index),
      value: 0
    }));
    
    setGrid(newGrid);
    setIsGameActive(true);
    setGameResult('pending');
    setRevealedCount(0);
    setCanCashout(false);
  };

  const resetGame = () => {
    setIsGameActive(false);
    setGrid(
      Array(25).fill(null).map(() => ({ revealed: false, isMine: false, value: 0 }))
    );
    setGameResult('pending');
    setRevealedCount(0);
    setCanCashout(false);
  };

  const cashout = () => {
    if (!canCashout || !isGameActive) return;
    
    // Reveal all mines
    setGrid(prev => prev.map(cell => ({
      ...cell,
      revealed: cell.revealed || cell.isMine
    })));
    
    // Award winnings
    updateBalance(potentialWin);
    toast.success(`You cashed out ${potentialWin} gems!`);
    
    setIsGameActive(false);
    setGameResult('win');
  };

  const handleCellClick = (index: number) => {
    if (!isGameActive || grid[index].revealed) return;
    
    if (grid[index].isMine) {
      // Hit a mine! Game over
      setGrid(prev => prev.map((cell, i) => ({
        ...cell,
        revealed: cell.revealed || cell.isMine || i === index
      })));
      
      setIsGameActive(false);
      setGameResult('lose');
      toast.error('BOOM! You hit a mine!');
      
    } else {
      // Safe cell! Update the grid
      setGrid(prev => prev.map((cell, i) => ({
        ...cell,
        revealed: cell.revealed || i === index,
        value: i === index ? nextCellMultiplier : cell.value
      })));
      
      setRevealedCount(prev => prev + 1);
      
      // Check if all safe cells are revealed (win condition)
      if (revealedCount + 1 >= 25 - minesCount) {
        updateBalance(potentialWin);
        setIsGameActive(false);
        setGameResult('win');
        toast.success('Perfect! You revealed all safe cells!');
      }
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Mines</h1>
          <p className="text-muted-foreground">Avoid mines and win big! The longer you play, the higher the risk and reward.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game controls */}
          <div className="col-span-1 bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium">Bet Amount</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                  disabled={isGameActive}
                  min={10}
                />
                <Button 
                  variant="outline" 
                  onClick={() => setBetAmount(prev => Math.max(10, prev * 2))}
                  disabled={isGameActive}
                >
                  2x
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    disabled={isGameActive}
                    className="text-xs"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Mines: {minesCount}</label>
                <span className="text-xs text-muted-foreground">More mines = higher risk & reward</span>
              </div>
              <Slider 
                value={[minesCount]} 
                min={1} 
                max={12}
                step={1}
                onValueChange={(value) => setMinesCount(value[0])}
                disabled={isGameActive}
              />
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 5, 10].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setMinesCount(amount)}
                    disabled={isGameActive}
                    className="text-xs"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>
            
            {isGameActive ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">Potential Win</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Gem className="h-5 w-5 text-gem" />
                    <span className="text-2xl font-bold gem-text">
                      {potentialWin}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Next: {(nextCellMultiplier * betAmount).toFixed(0)} gems
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={cashout}
                    disabled={!canCashout}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" /> Cashout
                  </Button>
                  <Button 
                    onClick={resetGame}
                    variant="destructive"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={startGame}
                disabled={!user || user.balance < betAmount}
                className="w-full bg-game-mines hover:bg-game-mines/90"
              >
                Start Game
              </Button>
            )}
          </div>
          
          {/* Game grid */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-5 gap-2">
              {grid.map((cell, index) => (
                <button
                  key={index}
                  className={`
                    aspect-square rounded-lg transition-all duration-200
                    ${!isGameActive && !cell.revealed ? 'bg-card hover:bg-card/80 cursor-not-allowed' : ''}
                    ${isGameActive && !cell.revealed ? 'bg-card hover:bg-primary/20 hover:shadow-md' : ''}
                    ${cell.revealed && cell.isMine ? 'bg-destructive text-destructive-foreground' : ''}
                    ${cell.revealed && !cell.isMine ? 'bg-primary/20 gem-border' : ''}
                    border border-border flex items-center justify-center
                  `}
                  onClick={() => handleCellClick(index)}
                  disabled={!isGameActive || cell.revealed}
                >
                  {cell.revealed && cell.isMine ? (
                    <Bomb className="h-6 w-6" />
                  ) : cell.revealed && !cell.isMine ? (
                    <div className="flex flex-col items-center">
                      <Gem className="h-4 w-4 text-gem mb-0.5" />
                      <span className="text-xs font-bold gem-text">{cell.value.toFixed(2)}x</span>
                    </div>
                  ) : (
                    ''
                  )}
                </button>
              ))}
            </div>
            
            {gameResult === 'lose' && (
              <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-lg">You Hit a Mine!</h3>
                <p className="text-muted-foreground">Better luck next time. Try again with a new game!</p>
              </div>
            )}
            
            {gameResult === 'win' && (
              <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-lg">You Won!</h3>
                <p className="text-muted-foreground">Congratulations! You've cashed out with {potentialWin} gems.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mines;
