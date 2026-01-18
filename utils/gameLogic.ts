
import { Position, TileData, Category } from '../types';
import { GRID_WIDTH, GRID_HEIGHT, THEMES } from '../constants';

export function createShuffledBoard(selectedThemes: Category[]): (TileData | null)[][] {
  const totalSlots = GRID_WIDTH * GRID_HEIGHT;
  // Ensure we have an even number of slots
  const pairCount = totalSlots / 2;
  
  const pool: TileData[] = [];
  const themePool = selectedThemes.length > 0 ? selectedThemes : Object.values(Category);

  for (let i = 0; i < pairCount; i++) {
    const category = themePool[Math.floor(Math.random() * themePool.length)];
    const theme = THEMES[category];
    const item = theme.items[Math.floor(Math.random() * theme.items.length)];
    
    const tile: TileData = {
      id: Math.random().toString(36).substr(2, 9),
      type: `${category}_${item.label}`,
      category,
      label: item.label,
      icon: item.icon,
    };
    
    // Add two of each to ensure pairs
    pool.push({ ...tile, id: tile.id + '_1' });
    pool.push({ ...tile, id: tile.id + '_2' });
  }

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const grid: (TileData | null)[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));
  let idx = 0;
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      grid[y][x] = pool[idx++];
    }
  }

  return grid;
}

export function canConnect(
  grid: (TileData | null)[][],
  p1: Position,
  p2: Position
): Position[] | null {
  if (p1.x === p2.x && p1.y === p2.y) return null;
  const tile1 = grid[p1.y][p1.x];
  const tile2 = grid[p2.y][p2.x];
  if (!tile1 || !tile2 || tile1.type !== tile2.type) return null;

  // Pathfinding with max 2 turns
  const queue: { pos: Position; dir: number; turns: number; path: Position[] }[] = [];
  const visited = new Map<string, number>(); // key: x,y,dir -> value: turns

  // Directions: 0: Right, 1: Down, 2: Left, 3: Up
  const dirs = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];

  // Initialize
  for (let d = 0; d < 4; d++) {
    queue.push({ pos: p1, dir: d, turns: 0, path: [p1] });
  }

  while (queue.length > 0) {
    const { pos, dir, turns, path } = queue.shift()!;

    const nextPos = { x: pos.x + dirs[dir].x, y: pos.y + dirs[dir].y };

    // Check bounds
    if (nextPos.x < -1 || nextPos.x > GRID_WIDTH || nextPos.y < -1 || nextPos.y > GRID_HEIGHT) continue;

    // Check if target reached
    if (nextPos.x === p2.x && nextPos.y === p2.y) {
      return [...path, nextPos];
    }

    // Check if path is blocked (must be outside the grid or empty)
    const isInside = nextPos.x >= 0 && nextPos.x < GRID_WIDTH && nextPos.y >= 0 && nextPos.y < GRID_HEIGHT;
    if (isInside && grid[nextPos.y][nextPos.x] !== null) continue;

    // Explore next directions
    for (let d = 0; d < 4; d++) {
      const nextTurns = d === dir ? turns : turns + 1;
      if (nextTurns <= 2) {
        const key = `${nextPos.x},${nextPos.y},${d}`;
        if (!visited.has(key) || visited.get(key)! > nextTurns) {
          visited.set(key, nextTurns);
          queue.push({ pos: nextPos, dir: d, turns: nextTurns, path: [...path, nextPos] });
        }
      }
    }
  }

  return null;
}

export function hasMoves(grid: (TileData | null)[][]): boolean {
  const tiles: { pos: Position; type: string }[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y][x]) tiles.push({ pos: { x, y }, type: grid[y][x]!.type });
    }
  }

  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i].type === tiles[j].type) {
        if (canConnect(grid, tiles[i].pos, tiles[j].pos)) return true;
      }
    }
  }
  return false;
}

export function shuffleRemaining(grid: (TileData | null)[][]): (TileData | null)[][] {
  const flat = grid.flat().filter(t => t !== null) as TileData[];
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }

  const newGrid: (TileData | null)[][] = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));
  let idx = 0;
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y][x] !== null) {
        newGrid[y][x] = flat[idx++];
      }
    }
  }
  return newGrid;
}
