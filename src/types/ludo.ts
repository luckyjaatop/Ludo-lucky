export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot' | 'remote';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1 = Yard, 0..50 = Main Track (from color's start), 51..56 = Home Path, 57 = Home Finish
  isHome: boolean;
  isYard: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  tokens: Token[];
  tokensAtHome: number;
  avatarSeed: string;
  isReady?: boolean;
}

export type GameMode = 'local' | 'vs_bot' | 'online';

export type GameStatus = 'idle' | 'waiting' | 'rolling' | 'moving' | 'finished';

export interface GameState {
  id: string;
  mode: GameMode;
  players: Player[];
  currentTurnIndex: number;
  diceValue: number | null;
  isDiceRolled: boolean;
  consecutiveSixes: number;
  validTokenMoves: number[]; // ids of tokens that can move
  winner: PlayerColor | null;
  status: GameStatus;
  turnTimeout: number; // seconds left for current turn
  lastActionMessage: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: PlayerColor;
  avatarSeed: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  maxPlayers: 2 | 3 | 4;
  players: {
    id: string;
    name: string;
    color: PlayerColor;
    avatarSeed: string;
    isReady: boolean;
    isHost: boolean;
  }[];
  state?: GameState;
  status: 'lobby' | 'playing' | 'finished';
  createdAt: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  claimed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  coins: number;
  gems: number;
  level: number;
  xp: number;
  avatarSeed: string;
  equippedDice: string;
  equippedPawn: string;
  unlockedDice: string[];
  unlockedPawns: string[];
  lastDailySpinDate: string | null;
  streakDays: number;
  lastStreakClaimDate: string | null;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    tokensCaptured: number;
    sixesRolled: number;
  };
}
