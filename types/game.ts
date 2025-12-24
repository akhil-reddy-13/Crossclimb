/** Game configuration */
export interface GameInfo {
  title: string;
  author?: string;
  words: Array<{ correct: string; hint: string }>;
  edgeWords: [string, string];
  edgeHint: string;
}

/** Current game state with user input */
export interface Game {
  title: string;
  author?: string;
  words: Array<{ correct: string; hint: string; current: string }>;
  edgeWords: [string, string];
  currentEdgeWords: [string, string];
  edgeHint: string;
  startTime?: number;
  endTime?: number;
}

export type GameStatus = 'idle' | 'error' | 'unsorted' | 'sorted' | 'solved';

export type GameMode = 'auto' | 'manual' | 'playing';

