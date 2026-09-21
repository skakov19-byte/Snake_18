import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useSnakeGame, Direction, Difficulty, PowerUpType, DEFAULT_LEVEL_IMAGES } from './hooks/useSnakeGame';
import { useTouchControls } from './hooks/useTouchControls';
import { 
  SnakeHead, 
  SnakeBody, 
  SnakeTail, 
  Apple,
  SlowPowerUp,
  LifePowerUp,
  BonusApple
} from './components/GameSprites';

function App() {
  const {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize,
    powerUps,
    activeEffects,
    lives,
    level,
    revealedCells,
    customImages,
    allLevelImages,
    startGame,
    togglePause,
    restart,
    nextLevel,
    changeDirection,
    changeDifficulty,
    addCustomImage,
    removeCustomImage,
  } = useSnakeGame();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        } else if (gameState === 'levelcomplete') {
          nextLevel();
        }
      }
    },
    [gameState, changeDirection, togglePause, restart, startGame, nextLevel]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      addCustomImage(result);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addCustomImage]);

  const getPowerUpComponent = (type: PowerUpType) => {
    switch (type) {
      case 'slow': return <SlowPowerUp />;
      case 'life': return <LifePowerUp />;
      case 'bonus': return <BonusApple />;
    }
  };

  // Build grid cells
  const gridCells = useMemo(() => {
    const cells: JSX.Element[] = [];
    const snakeMap = new Map<string, number>();
    snake.forEach((s, i) => snakeMap.set(`${s.x},${s.y}`, i));
    const foodKey = `${food.x},${food.y}`;
    const powerUpMap = new Map<string, PowerUpType>();
    powerUps.forEach(p => powerUpMap.set(`${p.position.x},${p.position.y}`, p.type));

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = `${x},${y}`;
        const snakeIndex = snakeMap.get(key);
        const isFood = key === foodKey;
        const powerUpType = powerUpMap.get(key);
        const isHead = snakeIndex === 0;
        const isTail = snakeIndex === snake.length - 1 && snake.length > 1;
        const isBody = snakeIndex !== undefined && !isHead && !isTail;

        let content = null;
        let cellBg = 'bg-slate-800/30';

        if (isHead) {
          content = <SnakeHead direction={direction} />;
          cellBg = '';
        } else if (isBody) {
          content = <SnakeBody index={snakeIndex!} total={snake.length} />;
          cellBg = '';
        } else if (isTail) {
          content = <SnakeTail />;
          cellBg = '';
        } else if (isFood) {
          content = <Apple />;
          cellBg = '';
        } else if (powerUpType) {
          content = getPowerUpComponent(powerUpType);
          cellBg = '';
        }

        cells.push(
          <div
            key={key}
            className={`p-[1px] aspect-square ${cellBg} rounded-sm transition-colors duration-100`}
          >
            {content}
          </div>
        );
      }
    }
    return cells;
  }, [snake, food, direction, gridSize, powerUps]);

  const difficulties: { value: Difficulty; label: string; color: string }[] = [
    { value: 'easy', label: 'Easy', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'hard', label: 'Hard', color: 'bg-red-500' },
  ];

  const now = Date.now();
  const hasSlow = activeEffects.some(e => e.type === 'slow' && e.expiresAt > now);
  
  const totalCells = gridSize * gridSize;
  const revealedCount = revealedCells.size;
  const progress = Math.round((revealedCount / totalCells) * 100);

  const currentLevelImage = allLevelImages[(level - 1) % allLevelImages.length];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center select-none overflow-hidden">
      {/* Header - Compact on mobile */}
      <div className="w-full max-w-lg px-3 pt-2 pb-1 md:px-4 md:pt-4 md:pb-2">
        <h1 className="text-xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-1 md:mb-4">
          🐍 Snake Game
        </h1>

        {/* Score Bar - Compact on mobile */}
        <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur rounded-lg md:rounded-xl px-2 md:px-4 py-1.5 md:py-3 border border-slate-700/50">
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">Score</span>
            <span className="text-lg md:text-2xl font-bold text-emerald-400 tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">Level</span>
            <span className="text-lg md:text-2xl font-bold text-cyan-400 tabular-nums">{level}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">Lives</span>
            <div className="flex gap-0.5 md:gap-1">
              {Array.from({ length: Math.min(lives, 5) }).map((_, i) => (
                <span key={i} className="text-sm md:text-xl">❤️</span>
              ))}
              {lives > 5 && <span className="text-xs md:text-xl">+{lives - 5}</span>}
            </div>
          </div>
        </div>

        {/* Progress Bar - Compact on mobile */}
        {gameState === 'playing' && (
          <div className="mt-1 md:mt-2 bg-slate-800/80 backdrop-blur rounded-lg md:rounded-xl px-2 md:px-4 py-1 md:py-2 border border-slate-700/50">
            <div className="flex items-center justify-between mb-0.5 md:mb-1">
              <span className="text-[10px] md:text-xs text-slate-400">Progress</span>
              <span className="text-[10px] md:text-xs text-cyan-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 md:h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Active Effects - Compact on mobile */}
        {activeEffects.length > 0 && (
          <div className="flex items-center justify-center gap-1 md:gap-2 mt-1 md:mt-2">
            {hasSlow && (
              <div className="flex items-center gap-0.5 md:gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <span className="text-xs md:text-sm">🐢</span>
                <span className="text-[10px] md:text-xs text-blue-300 font-medium">Slow</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game Board Container - Takes available space on mobile */}
      <div
        ref={touchRef}
        className="relative w-full max-w-lg flex-1 md:flex-none md:aspect-square bg-slate-900/80 backdrop-blur rounded-xl md:rounded-2xl border-2 border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden touch-none mx-3 md:mx-auto"
      >
        {/* Background Image (hidden, revealed by cells) */}
        {(gameState === 'playing' || gameState === 'paused' || gameState === 'levelcomplete') && (
          <div className="absolute inset-0 p-2">
            <div 
              className="w-full h-full grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const x = index % gridSize;
                const y = Math.floor(index / gridSize);
                const key = `${x},${y}`;
                const isRevealed = revealedCells.has(key);
                
                return (
                  <div
                    key={index}
                    className="p-[1px] aspect-square"
                  >
                    <div 
                      className={`w-full h-full transition-all duration-500 ${
                        isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                      }`}
                      style={{
                        backgroundImage: `url(${currentLevelImage})`,
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${(x / (gridSize - 1)) * 100}% ${(y / (gridSize - 1)) * 100}%`,
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Grid (snake, food, power-ups) */}
        <div
          className="relative w-full h-full grid gap-0 p-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {gridCells}
        </div>

        {/* Overlay for idle state */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl md:rounded-2xl animate-fade-in p-4">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
              <img 
                src="https://image.qwenlm.ai/generated-images/0c886763-0a8c-462e-a3af-a2cef5d9971d/_result.png" 
                alt="Snake" 
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
              <span className="text-3xl md:text-4xl">🍎</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Ready to Play?</h2>
            <p className="text-slate-400 text-xs md:text-sm mb-2 md:mb-4 text-center px-4 md:px-8">
              🍎 Apple reveals cells by difficulty<br/>
              ⭐ Golden apple = 5x more!<br/>
              🟢64 | 🟡16 | 🔴1 cell<br/>
              Complete the picture 🖼️
            </p>
            <p className="text-purple-400 text-[10px] md:text-xs mb-2 md:mb-4 text-center">
              🎨 {allLevelImages.length} levels!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2 md:px-8 md:py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm md:text-base font-bold rounded-lg md:rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-emerald-500/30"
            >
              Start Game
            </button>
            <p className="text-slate-500 text-[10px] md:text-xs mt-2 md:mt-4">or press Enter</p>
          </div>
        )}

        {/* Overlay for paused state */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl md:rounded-2xl animate-fade-in">
            <div className="text-4xl md:text-5xl mb-2 md:mb-4">⏸️</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Paused</h2>
            <p className="text-slate-400 text-xs md:text-sm mb-4 md:mb-6">Press Space or tap Resume</p>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={togglePause}
                className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm md:text-base font-bold rounded-lg md:rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-emerald-500/30"
              >
                Resume
              </button>
              <button
                onClick={restart}
                className="px-4 py-2 md:px-6 md:py-3 bg-slate-700 text-white text-sm md:text-base font-bold rounded-lg md:rounded-xl hover:scale-105 active:scale-95 transition-transform border border-slate-600"
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {/* Overlay for level complete */}
        {gameState === 'levelcomplete' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl md:rounded-2xl animate-fade-in p-4">
            <div className="text-4xl md:text-5xl mb-2 md:mb-4">🎉</div>
            <h2 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 mb-2 md:mb-4">
              Level {level} Complete!
            </h2>
            
            {/* Show full image */}
            <div className="w-40 h-40 md:w-64 md:h-64 mb-3 md:mb-6 rounded-lg md:rounded-xl overflow-hidden border-4 border-amber-400 shadow-2xl shadow-amber-400/30">
              <img 
                src={currentLevelImage} 
                alt={`Level ${level} complete`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <p className="text-slate-300 text-sm md:text-lg mb-2 md:mb-4">
              Score: <span className="font-bold text-emerald-400">{score}</span>
            </p>
            
            <button
              onClick={nextLevel}
              className="px-6 py-2 md:px-8 md:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm md:text-base font-bold rounded-lg md:rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-amber-500/30"
            >
              Next Level →
            </button>
            <p className="text-slate-500 text-[10px] md:text-xs mt-2 md:mt-3">or press Enter</p>
          </div>
        )}

        {/* Overlay for game over */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl md:rounded-2xl animate-fade-in p-4">
            <div className="text-4xl md:text-5xl mb-2 md:mb-4">💀</div>
            <h2 className="text-xl md:text-2xl font-bold text-rose-400 mb-1 md:mb-2">Game Over!</h2>
            <p className="text-slate-300 text-xs md:text-lg mb-0.5 md:mb-1">
              Level: <span className="font-bold text-cyan-400">{level}</span>
            </p>
            <p className="text-slate-300 text-xs md:text-lg mb-0.5 md:mb-1">
              Revealed: <span className="font-bold text-emerald-400">{progress}%</span>
            </p>
            <p className="text-slate-300 text-xs md:text-lg mb-1 md:mb-1">Score: <span className="font-bold text-emerald-400">{score}</span></p>
            {score >= highScore && score > 0 && (
              <p className="text-amber-400 text-xs md:text-sm font-bold mb-2 md:mb-4 animate-bounce">🏆 New High Score!</p>
            )}
            {(score < highScore || score === 0) && <div className="mb-2 md:mb-4" />}
            <button
              onClick={restart}
              className="px-6 py-2 md:px-8 md:py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm md:text-base font-bold rounded-lg md:rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-emerald-500/30"
            >
              Play Again
            </button>
            <p className="text-slate-500 text-[10px] md:text-xs mt-2 md:mt-3">or press Enter</p>
          </div>
        )}
      </div>

      {/* Controls - Compact on mobile, hidden during gameplay on mobile */}
      <div className="w-full max-w-lg px-3 py-2 md:px-4 md:py-4 md:space-y-3 space-y-1 md:space-y-3">
        {/* Custom Images Section - Desktop only */}
        {(gameState === 'idle' || gameState === 'gameover') && (
          <div className="hidden md:block bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-300">📸 Level Images</h3>
              <label className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                + Add Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            {customImages.length > 0 ? (
              <>
                <p className="text-xs text-purple-400 mb-2">✨ Using your custom images</p>
                <div className="grid grid-cols-4 gap-2">
                  {customImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-purple-500/50">
                      <img src={img} alt={`Custom ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeCustomImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5 font-medium">
                        Level {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Delete all to use default images
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400 mb-2">🎮 Using default images</p>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_LEVEL_IMAGES.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-600">
                      <img src={img} alt={`Default ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5 font-medium">
                        Level {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Add your own images to replace defaults
                </p>
              </>
            )}
          </div>
        )}

        {/* Action Buttons - Compact on mobile */}
        <div className="flex items-center justify-center gap-2 md:gap-3">
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-3 py-1.5 md:px-5 md:py-2.5 bg-slate-700 text-white text-sm md:text-base font-medium rounded-lg md:rounded-xl hover:bg-slate-600 active:scale-95 transition-all border border-slate-600"
            >
              ⏸ Pause
            </button>
          )}
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={restart}
              className="px-3 py-1.5 md:px-5 md:py-2.5 bg-slate-700 text-white text-sm md:text-base font-medium rounded-lg md:rounded-xl hover:bg-slate-600 active:scale-95 transition-all border border-slate-600"
            >
              🔄 Restart
            </button>
          )}
        </div>

        {/* Difficulty Selector - Horizontal on mobile, vertical on desktop */}
        <div className="flex items-center justify-center gap-1 md:gap-2">
          {difficulties.map(d => {
            const cellsPerApple = d.value === 'easy' ? 64 : d.value === 'medium' ? 16 : 1;
            return (
              <button
                key={d.value}
                onClick={() => changeDifficulty(d.value)}
                disabled={gameState === 'playing'}
                className={`px-2 py-1 md:px-4 md:py-1.5 rounded-md md:rounded-lg text-xs md:text-sm font-medium transition-all ${
                  difficulty === d.value
                    ? `${d.color} text-white shadow-lg scale-105`
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50'
                } ${gameState === 'playing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div>{d.label}</div>
                <div className="text-[10px] md:text-xs opacity-75">{cellsPerApple}</div>
              </button>
            );
          })}
        </div>

        {/* Power-ups Legend - Compact on mobile */}
        <div className="flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-xs text-slate-400">
          <span className="flex items-center gap-0.5 md:gap-1">
            <span className="text-red-400">🍎</span>={difficulty === 'easy' ? 64 : difficulty === 'medium' ? 16 : 1}
          </span>
          <span className="flex items-center gap-0.5 md:gap-1">
            <span className="text-amber-400">⭐</span>={difficulty === 'easy' ? 320 : difficulty === 'medium' ? 80 : 5}
          </span>
          <span className="flex items-center gap-0.5 md:gap-1">
            <span className="text-blue-400">🐢</span>Slow
          </span>
          <span className="flex items-center gap-0.5 md:gap-1">
            <span className="text-pink-400">❤️</span>Life
          </span>
        </div>

        {/* Mobile D-Pad - Compact */}
        <div className="flex flex-col items-center gap-0.5 md:hidden">
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('UP'); }}
            className="w-12 h-12 bg-slate-700/80 rounded-lg flex items-center justify-center text-white text-xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
          >
            ▲
          </button>
          <div className="flex gap-0.5">
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
              className="w-12 h-12 bg-slate-700/80 rounded-lg flex items-center justify-center text-white text-xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
            >
              ◀
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); togglePause(); }}
              className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center text-white text-base active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
            >
              {gameState === 'playing' ? '⏸' : '▶'}
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
              className="w-12 h-12 bg-slate-700/80 rounded-lg flex items-center justify-center text-white text-xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
            >
              ▶
            </button>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
            className="w-12 h-12 bg-slate-700/80 rounded-lg flex items-center justify-center text-white text-xl active:bg-slate-600 active:scale-90 transition-all border border-slate-600/50"
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
