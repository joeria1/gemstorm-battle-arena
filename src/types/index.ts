
export interface User {
  id: string;
  username: string;
  balance: number;
  avatar?: string;
}

export interface GameHistory {
  id: string;
  userId: string;
  gameType: 'mines' | 'blackjack' | 'cases';
  betAmount: number;
  winAmount: number | null;
  timestamp: Date;
  isWin: boolean;
}

export interface CaseBattle {
  id: string;
  name: string;
  price: number;
  casesToOpen: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'in-progress' | 'completed';
}

export interface MinesGame {
  id: string;
  gridSize: number;
  minesCount: number;
  placedMines: number[];
  revealedCells: number[];
  status: 'active' | 'won' | 'lost';
  betAmount: number;
  potentialWin: number;
}

export interface BlackjackGame {
  id: string;
  playerHand: string[];
  dealerHand: string[];
  playerValue: number;
  dealerValue: number;
  status: 'betting' | 'playing' | 'dealer-turn' | 'complete';
  betAmount: number;
  result: 'pending' | 'player-win' | 'dealer-win' | 'push';
}

export interface Rain {
  id: string;
  totalAmount: number;
  participantsCount: number;
  distributedAt: Date | null;
  status: 'pending' | 'active' | 'completed';
  timeRemaining: number;
}
