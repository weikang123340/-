
import React from 'react';
import Tile from './Tile';
import { Position, TileData } from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants';

interface BoardProps {
  grid: (TileData | null)[][];
  selected: Position | null;
  path: Position[];
  onTileClick: (x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({ grid, selected, path, onTileClick }) => {
  return (
    <div className="relative p-2 bg-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
      {/* Tile Grid */}
      <div 
        className="grid gap-2"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_HEIGHT}, minmax(0, 1fr))`
        }}
      >
        {grid.map((row, y) =>
          row.map((tile, x) => (
            <Tile
              key={`${x}-${y}`}
              tile={tile}
              isSelected={selected?.x === x && selected?.y === y}
              onClick={() => onTileClick(x, y)}
            />
          ))
        )}
      </div>

      {/* Connection Path Overlay */}
      {path.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-20"
          viewBox={`0 0 ${GRID_WIDTH * 100} ${GRID_HEIGHT * 100}`}
          preserveAspectRatio="none"
          style={{ width: 'calc(100% - 16px)', height: 'calc(100% - 16px)', margin: '8px' }}
        >
          <path
            d={`M ${path.map(p => `${p.x * 100 + 50} ${p.y * 100 + 50}`).join(' L ')}`}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
            style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }}
          />
        </svg>
      )}
    </div>
  );
};

export default Board;
