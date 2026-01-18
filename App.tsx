import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category, GameState, Position } from './types';
import { INITIAL_TIME, THEMES } from './constants';
import { createShuffledBoard, canConnect, hasMoves, shuffleRemaining } from './utils/gameLogic';
import Board from './components/Board';
import { getVictoryMessage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    grid: createShuffledBoard([]),
    selected: null,
    score: 0,
    timeLeft: INITIAL_TIME,
    isGameOver: false,
    isVictory: false,
    level: 1,
    message: '',
    path: [],
  });

  // Fixed: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid namespace errors in browser environments
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startNewGame = (level = 1, score = 0) => {
    setState({
      grid: createShuffledBoard([]),
      selected: null,
      score,
      timeLeft: Math.max(30, INITIAL_TIME - (level - 1) * 10),
      isGameOver: false,
      isVictory: false,
      level,
      message: '',
      path: [],
    });
  };

  useEffect(() => {
    if (state.timeLeft > 0 && !state.isGameOver && !state.isVictory) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0, isGameOver: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isGameOver, state.isVictory]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (state.isGameOver || state.isVictory) return;

    setState(prev => {
      if (!prev.selected) {
        return { ...prev, selected: { x, y } };
      }

      // Check if clicking the same tile
      if (prev.selected.x === x && prev.selected.y === y) {
        return { ...prev, selected: null };
      }

      const connectionPath = canConnect(prev.grid, prev.selected, { x, y });

      if (connectionPath) {
        const newGrid = prev.grid.map(row => [...row]);
        newGrid[prev.selected.y][prev.selected.x] = null;
        newGrid[y][x] = null;

        const points = 100 + Math.floor(prev.timeLeft / 2);
        const newScore = prev.score + points;

        // Check if level cleared
        const remaining = newGrid.flat().filter(t => t !== null).length;
        if (remaining === 0) {
          (async () => {
             const victoryMsg = await getVictoryMessage(newScore, prev.level);
             setState(s => ({ ...s, isVictory: true, message: victoryMsg }));
          })();
          return { ...prev, grid: newGrid, score: newScore, path: connectionPath, selected: null };
        }

        // Check for deadlocks
        let nextGrid = newGrid;
        if (!hasMoves(newGrid)) {
           nextGrid = shuffleRemaining(newGrid);
        }

        // Clear path after a short delay
        setTimeout(() => setState(s => ({ ...s, path: [] })), 300);

        return {
          ...prev,
          grid: nextGrid,
          score: newScore,
          selected: null,
          path: connectionPath,
        };
      }

      return { ...prev, selected: { x, y } };
    });
  }, [state.isGameOver, state.isVictory, state.selected]);

  const handleHint = () => {
    const tiles: { pos: Position; type: string }[] = [];
    for (let y = 0; y < state.grid.length; y++) {
      for (let x = 0; x < state.grid[0].length; x++) {
        if (state.grid[y][x]) tiles.push({ pos: { x, y }, type: state.grid[y][x]!.type });
      }
    }

    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i].type === tiles[j].type) {
          const path = canConnect(state.grid, tiles[i].pos, tiles[j].pos);
          if (path) {
            setState(prev => ({ ...prev, selected: tiles[i].pos }));
            setTimeout(() => setState(prev => ({ ...prev, path })), 200);
            setTimeout(() => setState(prev => ({ ...prev, path: [], selected: null })), 800);
            return;
          }
        }
      }
    }
  };

  const handleShuffle = () => {
    setState(prev => ({
      ...prev,
      grid: shuffleRemaining(prev.grid),
      selected: null,
      score: Math.max(0, prev.score - 50)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Connect Master
          </h1>
          <p className="text-slate-400 text-sm">Level {state.level} • Connect matching pairs!</p>
        </div>
        
        <div className="flex gap-4 items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Time</p>
            <p className={`text-xl font-mono ${state.timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
              {Math.floor(state.timeLeft / 60)}:{(state.timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Score</p>
            <p className="text-xl font-mono text-emerald-400">{state.score}</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-5xl flex-1 flex flex-col justify-center">
        <Board
          grid={state.grid}
          selected={state.selected}
          path={state.path}
          onTileClick={handleTileClick}
        />
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-4xl mt-6 flex justify-center gap-4">
        <button
          onClick={handleHint}
          disabled={state.isGameOver || state.isVictory}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all border border-slate-700 flex items-center justify-center gap-2"
        >
          💡 提示 (Hint)
        </button>
        <button
          onClick={handleShuffle}
          disabled={state.isGameOver || state.isVictory}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all border border-slate-700 flex items-center justify-center gap-2"
        >
          🔀 重排 (Shuffle)
        </button>
        <button
          onClick={() => startNewGame()}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          🔄 重新开始
        </button>
      </div>

      {/* Modals */}
      {(state.isGameOver || state.isVictory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center transform animate-in fade-in zoom-in duration-300">
            {state.isVictory ? (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-emerald-400 mb-2">通关大捷!</h2>
                <p className="text-slate-300 mb-6 italic">"{state.message || '正在获取成就点评...'}"</p>
                <div className="space-y-4">
                  <button
                    onClick={() => startNewGame(state.level + 1, state.score)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/20"
                  >
                    挑战下一关
                  </button>
                  <button
                    onClick={() => startNewGame(1, 0)}
                    className="w-full py-2 text-slate-400 hover:text-white"
                  >
                    回第一关
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⌛</div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">时间到!</h2>
                <p className="text-slate-400 mb-6">不要灰心，再来一次试试？</p>
                <p className="text-slate-300 mb-6">最终得分: <span className="text-emerald-400 font-bold">{state.score}</span></p>
                <button
                  onClick={() => startNewGame(state.level, 0)}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/20"
                >
                  重试本关
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Theme Indicators */}
      <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-4">
        {Object.entries(THEMES).map(([cat, theme]) => (
          <div key={cat} className="group relative flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-blue-600 transition-colors">
              {theme.items[0].icon}
            </div>
            <span className="absolute left-12 px-2 py-1 bg-slate-800 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {theme.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;