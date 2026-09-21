import { useEffect, useCallback, useMemo } from 'react';
import { useSnakeGame, Direction, Difficulty } from './hooks/useSnakeGame';
import { useTouchControls } from './hooks/useTouchControls';

function App() {
  const {
    snake,
    food,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize,
    startGame,
    togglePause,
    restart,
    changeDirection,
    changeDifficulty,
  } = useSnakeGame();

  const touchRef = useTouchControls(changeDirection, gameState === 'playing');

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        if (gameState === 'playing') {
          changeDirection(keyMap[e.key]);
        }
      }

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause();
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameover' || gameState === 'paused') {
          restart();
        }
      }

      if (e.key === 'Enter') {
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        }
      }
    },
    [gameState, changeDirection, togglePause, restart, startGame]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Build grid cells
  const gridCells = useMemo(() => {
    const cells: JSX.Element[] = [];
    const snakeSet = new Set(snake.map(s => `${s.x},${s.y}`));
    const headKey = `${snake[0].x},${snake[0].y}`;
    const foodKey = `${food.x},${food.y}`;
    const tailKey = `${snake[snake.length - 1].x},${snake[snake.length - 1].y}`;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = `${x},${y}`;
        const isHead = key === headKey;
        const isTail = key === tailKey && snake.length > 1;
        const isBody = snakeSet.has(key) && !isHead && !isTail;
        const isFood = key === foodKey;

        let cellClass = 'w-full h-full rounded-sm transition-all duration-75 ';

        if (isHead) {
          cellClass += 'bg-emerald-400 shadow-lg shadow-emerald-400/50 scale-110 z-10';
        } else if (isBody) {
          cellClass += 'bg-emerald-500/90 rounded-sm';
        } else if (isTail) {
          cellClass += 'bg-emerald-600/70 rounded-sm';
        } else if (isFood) {
          cellClass += 'bg-rose-400 rounded-full animate-pulse shadow-lg shadow-rose-400/50 scale-90';
        } else {
          cellClass += 'bg-slate-800/40';
        }

        cells.push(
          <div
            key={key}
            className="p-[1px] aspect-square"
          >
            <div className={cellClass} />
          </div>
        );
      }
    }
    return cells;
  }, [snake, food, gridSize]);

  const difficulties: { value: Difficulty; label: string; color: string }[] = [
    { value: 'easy', label: 'Easy', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'hard', label: 'Hard', color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
          🐍 Snake Game
        </h1>

        {/* Score Bar */}
        <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur rounded-xl px-4 py-3 border border-slate-700/50">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Score</span>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Best</span>
            <span className="text-2xl font-bold text-amber-400 tabular-nums">{highScore}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Length</span>
            <span className="text-2xl font-bold text-cyan-400 tabular-nums">{snake.length}</span>
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div
        ref={touchRef}
        className="relative w-full max-w-lg aspect-square bg-slate-900/80 backdrop-blur rounded-2xl border-2 border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden touch-none"
      >
        {/* Grid */}
        <div
          className="w-full h-full grid gap-0 p-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {gridCells}
        </div>

        {/* Overlay for idle state */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl animate-fade-in">
            <div className="text-6xl mb-4">🐍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Play?</h2>
            <p className="text-slate-400 text-sm mb-6 text-center px-8">
              Use arrow keys, WASD, or swipe to control the snake
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-emerald-500/30"
            >
              Start Game
            </button>
            <p className="text-slate-500 text-xs mt-4">or press Enter</p>
          </div>
        )}

        {/* Overlay for paused state */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl animate-fade-in">
            <div className="text-5xl mb-4">⏸️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Paused</h2>
            <p className="text-slate-400 text-sm mb-6">Press Space or tap Resume</p>
            <div className="flex gap-3">
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-emerald-500/30"
              >
                Resume
              </button>
              <button
                onClick={restart}
                className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform border border-slate-600"
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {/* Overlay for game over */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl animate-fade-in">
            <div className="text-5xl mb-4">💀</div>
            <h2 className="text-2xl font-bold text-rose-400 mb-2">Game Over!</h2>
            <p className="text-slate-300 text-lg mb-1">Score: <span className="font-bold text-emerald-400">{score}</span></p>
            {score >= highScore && score > 0 && (
              <p className="text-amber-400 text-sm font-bold mb-4 animate-bounce">🏆 New High Score!</p>
            )}
            {(score < highScore || score === 0) && <div className="mb-4" />}
            <button
              onClick={restart}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-emerald-500/30"
            >
              Play Again
            </button>
            <p className="text-slate-500 text-xs mt-3">or press Enter</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg mt-4 space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-5 py-2.5 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 active:scale-95 transition-all border border-slate-600"
            >
              ⏸ Pause
            </button>
          )}
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={restart}
              className="px-5 py-2.5 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 active:scale-95 transition-all border border-slate-600"
            >
              🔄 Restart
            </button>
          )}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-slate-400 mr-2 uppercase tracking-wider">Difficulty:</span>
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => changeDifficulty(d.value)}
              disabled={gameState === 'playing'}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                difficulty === d.value
                  ? `${d.color} text-white shadow-lg scale-105`
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50'
              } ${gameState === 'playing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Mobile D-Pad */}
        <div className="flex flex-col items-center gap-1 md:hidden mt-4">
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('UP'); }}
            className="w-14 h-14 bg-slate-700/80 rounded-xl flex items-center justify-center text-white text-2xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
          >
            ▲
          </button>
          <div className="flex gap-1">
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
              className="w-14 h-14 bg-slate-700/80 rounded-xl flex items-center justify-center text-white text-2xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
            >
              ◀
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); togglePause(); }}
              className="w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center text-white text-lg active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
            >
              {gameState === 'playing' ? '⏸' : '▶'}
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
              className="w-14 h-14 bg-slate-700/80 rounded-xl flex items-center justify-center text-white text-2xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
            >
              ▶
            </button>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
            className="w-14 h-14 bg-slate-700/80 rounded-xl flex items-center justify-center text-white text-2xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
          >
            ▼
          </button>
        </div>

        {/* Keyboard hints for desktop */}
        <div className="hidden md:flex items-center justify-center gap-4 text-xs text-slate-500 mt-2">
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 font-mono">↑↓←→</kbd> Move
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 font-mono">Space</kbd> Pause
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 font-mono">R</kbd> Restart
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
