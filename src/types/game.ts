export type GameScreen =
  | 'menu'
  | 'levelSelect'
  | 'playing'
  | 'leaderboard'
  | 'profile'
  | 'howToPlay'
  | 'profileCreation';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface LevelConfig {
  id: number;
  name: string;
  targetScore: number;
  aiSpeed: number;
  aiErrorMargin: number;
  ballBaseSpeed: number;
  timeLimit: number;
  description: string;
  unlockRequirement: number;
}

export interface LevelProgress {
  bestScore: number;
  stars: number;
  completed: boolean;
}

export interface AIPersonality {
  name: string;
  playstyle: 'aggressive' | 'defensive' | 'balanced';
  reactionSpeed: number;
  errorRate: number;
  favoriteShot: 'smash' | 'lob' | 'drive';
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
  showFPS: boolean;
}

export interface GameCharacter {
  id: number;
  name: string;
  description: string;
  image: string;
  style: 'aggressive' | 'balanced' | 'defensive';
}

export interface PlayerProfile {
  username: string;
  characterId: number;
  characterName: string;
  totalMatches: number;
  totalWins: number;
  totalStars: number;
  endlessHighScore: number;
  lastPlayedAt: number;
  exists: boolean;
}

export interface MatchResult {
  player: string;
  levelId: number;
  playerScore: number;
  aiScore: number;
  starsEarned: number;
  rallyLength: number;
  timestamp: number;
}
