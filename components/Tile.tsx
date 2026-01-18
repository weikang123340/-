
import React from 'react';
import { TileData } from '../types';

interface TileProps {
  tile: TileData | null;
  isSelected: boolean;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ tile, isSelected, onClick }) => {
  if (!tile) return <div className="w-full h-full bg-slate-800/20 rounded-md" />;

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full aspect-square flex flex-col items-center justify-center rounded-lg shadow-lg transition-all duration-200
        ${isSelected 
          ? 'bg-blue-500 scale-105 ring-4 ring-blue-300 z-10 shadow-blue-500/50' 
          : 'bg-slate-700 hover:bg-slate-600 hover:-translate-y-1 active:scale-95'
        }
      `}
    >
      <span className="text-3xl sm:text-4xl mb-1">{tile.icon}</span>
      <span className="text-[10px] sm:text-xs text-slate-300 font-medium truncate w-full px-1 text-center">
        {tile.label}
      </span>
      {isSelected && (
        <div className="absolute inset-0 rounded-lg animate-pulse bg-blue-400/20" />
      )}
    </button>
  );
};

export default Tile;
