
export enum Category {
  SOE = 'SOE',
  SPORTS = 'SPORTS',
  FRUIT = 'FRUIT',
  CAR = 'CAR',
  WEAPON = 'WEAPON'
}

export interface TileData {
  id: string;
  type: string;
  category: Category;
  label: string;
  icon: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  grid: (TileData | null)[][];
  selected: Position | null;
  score: number;
  timeLeft: number;
  isGameOver: boolean;
  isVictory: boolean;
  level: number;
  message: string;
  path: Position[];
}

export interface ThemeConfig {
  key: string;
  label: string;
  items: { label: string; icon: string }[];
}
