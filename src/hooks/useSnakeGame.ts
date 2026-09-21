import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover' | 'levelcomplete';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type PowerUpType = 'slow' | 'life' | 'bonus';

export interface PowerUp {
  id: number;
  type: PowerUpType;
  position: Position;
  spawnTime: number;
  duration: number;
}

export interface ActiveEffect {
  type: PowerUpType;
  expiresAt: number;
}

const GRID_SIZE = 20;

const SPEED_MAP: Record<Difficulty, number> = {
  easy: 180,
  medium: 120,
  hard: 75,
};

// Default level images
const DEFAULT_LEVEL_IMAGES = [
  'https://image.qwenlm.ai/generated-images/056c1ff8-4e51-49da-8702-6c9f5f722c0d/_result.png',
  'https://image.qwenlm.ai/generated-images/99cc2f6c-2082-41d1-b7f2-751523218646/_result.png',
  'https://image.qwenlm.ai/generated-images/12b19e29-d4c7-4083-ac6d-72631696e135/_result.png',
];

const POWERUP_DURATION = 8000;
const SLOW_EFFECT_DURATION = 5000;
const POWERUP_SPAWN_CHANCE = 0.35;

function getRandomPosition(exclude: Position[]): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (exclude.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function getInitialSnake(): Position[] {
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

export function useSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(getInitialSnake());
  const [food, setFood] = useState<Position>(() => getRandomPosition(getInitialSnake()));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('snake-high-score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [lives, setLives] = useState(1);
  const [lastEaten, setLastEaten] = useState<number>(0);
  const [level, setLevel] = useState(1);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [customImages, setCustomImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('snake-custom-images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction | null>(null);
  const gameStateRef = useRef<GameState>('idle');
  const snakeRef = useRef<Position[]>(getInitialSnake());
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activeEffectsRef = useRef<ActiveEffect[]>([]);
  const livesRef = useRef(1);
  const revealedCellsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<number | null>(null);
  const powerUpIdRef = useRef(0);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { powerUpsRef.current = powerUps; }, [powerUps]);
  useEffect(() => { activeEffectsRef.current = activeEffects; }, [activeEffects]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { revealedCellsRef.current = revealedCells; }, [revealedCells]);

  const clearGameLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const addEffect = useCallback((type: PowerUpType, duration: number) => {
    const expiresAt = Date.now() + duration;
    setActiveEffects(prev => {
      const filtered = prev.filter(e => e.type !== type);
      const updated = [...filtered, { type, expiresAt }];
      activeEffectsRef.current = updated;
      return updated;
    });
  }, []);

  const spawnPowerUp = useCallback(() => {
    const types: PowerUpType[] = ['slow', 'life', 'bonus'];
    const weights = [0.4, 0.2, 0.4];
    
    const random = Math.random();
    let cumulative = 0;
    let selectedType: PowerUpType = 'slow';
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selectedType = types[i];
        break;
      }
    }

    const exclude = [...snakeRef.current, foodRef.current, ...powerUpsRef.current.map(p => p.position)];
    const position = getRandomPosition(exclude);
    
    const newPowerUp: PowerUp = {
      id: powerUpIdRef.current++,
      type: selectedType,
      position,
      spawnTime: Date.now(),
      duration: POWERUP_DURATION,
    };

    setPowerUps(prev => {
      const updated = [...prev, newPowerUp];
      powerUpsRef.current = updated;
      return updated;
    });
  }, []);

  const revealRandomCells = useCallback((count: number) => {
    const allCells: string[] = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        if (!revealedCellsRef.current.has(key)) {
          allCells.push(key);
        }
      }
    }

    if (allCells.length === 0) return;

    // Shuffle and take 'count' cells
    const shuffled = allCells.sort(() => Math.random() - 0.5);
    const cellsToReveal = shuffled.slice(0, Math.min(count, allCells.length));
    
    setRevealedCells(prev => {
      const updated = new Set(prev);
      cellsToReveal.forEach(cell => updated.add(cell));
      revealedCellsRef.current = updated;
      return updated;
    });
  }, []);

  const checkLevelComplete = useCallback(() => {
    const totalCells = GRID_SIZE * GRID_SIZE;
    if (revealedCellsRef.current.size >= totalCells) {
      setGameState('levelcomplete');
      clearGameLoop();
      return true;
    }
    return false;
  }, [clearGameLoop]);

  const tick = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const currentDirection = nextDirectionRef.current || directionRef.current;
    if (nextDirectionRef.current) {
      directionRef.current = nextDirectionRef.current;
      setDirection(nextDirectionRef.current);
      nextDirectionRef.current = null;
    }

    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const head = currentSnake[0];

    let newHead: Position;
    switch (currentDirection) {
      case 'UP':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'DOWN':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'LEFT':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'RIGHT':
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    newHead = {
      x: (newHead.x + GRID_SIZE) % GRID_SIZE,
      y: (newHead.y + GRID_SIZE) % GRID_SIZE,
    };

    const willEat = newHead.x === currentFood.x && newHead.y === currentFood.y;
    const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
    const hitSelf = bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y);

    if (hitSelf) {
      if (livesRef.current > 1) {
        setLives(prev => {
          const updated = prev - 1;
          livesRef.current = updated;
          return updated;
        });
        const initialSnake = getInitialSnake();
        setSnake(initialSnake);
        snakeRef.current = initialSnake;
        const newFood = getRandomPosition(initialSnake);
        setFood(newFood);
        foodRef.current = newFood;
        setPowerUps([]);
        powerUpsRef.current = [];
        return;
      } else {
        setGameState('gameover');
        clearGameLoop();
        return;
      }
    }

    const newSnake = [newHead, ...currentSnake];
    if (!willEat) {
      newSnake.pop();
    }

    setSnake(newSnake);
    snakeRef.current = newSnake;

    if (willEat) {
      const points = 10;
      const newScore = scoreRef.current + points;
      setScore(newScore);
      scoreRef.current = newScore;
      setLastEaten(Date.now());

      setHighScore(prev => {
        if (newScore > prev) {
          try {
            localStorage.setItem('snake-high-score', String(newScore));
          } catch { /* ignore */ }
          return newScore;
        }
        return prev;
      });

      // Reveal 1 cell for regular apple (10 points)
      revealRandomCells(1);

      // Check if level is complete
      setTimeout(() => {
        checkLevelComplete();
      }, 100);

      const newFood = getRandomPosition(newSnake);
      setFood(newFood);
      foodRef.current = newFood;

      if (Math.random() < POWERUP_SPAWN_CHANCE) {
        spawnPowerUp();
      }
    } else {
      const pickedUp = powerUpsRef.current.find(p => 
        p.position.x === newHead.x && p.position.y === newHead.y
      );

      if (pickedUp) {
        setPowerUps(prev => {
          const updated = prev.filter(p => p.id !== pickedUp.id);
          powerUpsRef.current = updated;
          return updated;
        });

        switch (pickedUp.type) {
          case 'slow':
            addEffect('slow', SLOW_EFFECT_DURATION);
            break;
          case 'life':
            setLives(prev => {
              const updated = prev + 1;
              livesRef.current = updated;
              return updated;
            });
            break;
          case 'bonus':
            const bonusPoints = 50;
            const newScore = scoreRef.current + bonusPoints;
            setScore(newScore);
            scoreRef.current = newScore;
            setHighScore(prev => {
              if (newScore > prev) {
                try {
                  localStorage.setItem('snake-high-score', String(newScore));
                } catch { /* ignore */ }
                return newScore;
              }
              return prev;
            });
            // Reveal 5 cells for golden apple (50 points)
            revealRandomCells(5);
            setTimeout(() => {
              checkLevelComplete();
            }, 100);
            break;
        }
      }
    }

    const now = Date.now();
    const expiredPowerUps = powerUpsRef.current.filter(p => now - p.spawnTime > p.duration);
    if (expiredPowerUps.length > 0) {
      setPowerUps(prev => {
        const updated = prev.filter(p => now - p.spawnTime <= p.duration);
        powerUpsRef.current = updated;
        return updated;
      });
    }

    const expiredEffects = activeEffectsRef.current.filter(e => e.expiresAt <= now);
    if (expiredEffects.length > 0) {
      setActiveEffects(prev => {
        const updated = prev.filter(e => e.expiresAt > now);
        activeEffectsRef.current = updated;
        return updated;
      });
    }
  }, [clearGameLoop, addEffect, spawnPowerUp, revealRandomCells, checkLevelComplete]);

  const startGameLoop = useCallback(() => {
    clearGameLoop();
    let speed = SPEED_MAP[difficulty];
    
    if (activeEffectsRef.current.some(e => e.type === 'slow' && e.expiresAt > Date.now())) {
      speed = Math.floor(speed * 1.8);
    }
    
    intervalRef.current = window.setInterval(tick, speed);
  }, [difficulty, tick, clearGameLoop]);

  const startGame = useCallback(() => {
    clearGameLoop();
    const initialSnake = getInitialSnake();
    const initialFood = getRandomPosition(initialSnake);

    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setFood(initialFood);
    foodRef.current = initialFood;
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = null;
    setScore(0);
    scoreRef.current = 0;
    setPowerUps([]);
    powerUpsRef.current = [];
    setActiveEffects([]);
    activeEffectsRef.current = [];
    setLives(1);
    livesRef.current = 1;
    setLevel(1);
    setRevealedCells(new Set());
    revealedCellsRef.current = new Set();
    setGameState('playing');
  }, [clearGameLoop]);

  const nextLevel = useCallback(() => {
    clearGameLoop();
    const initialSnake = getInitialSnake();
    const initialFood = getRandomPosition(initialSnake);

    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setFood(initialFood);
    foodRef.current = initialFood;
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = null;
    setPowerUps([]);
    powerUpsRef.current = [];
    setActiveEffects([]);
    activeEffectsRef.current = [];
    setRevealedCells(new Set());
    revealedCellsRef.current = new Set();
    setLevel(prev => prev + 1);
    setGameState('playing');
  }, [clearGameLoop]);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      setGameState('paused');
      clearGameLoop();
    } else if (gameStateRef.current === 'paused') {
      setGameState('playing');
    }
  }, [clearGameLoop]);

  const restart = useCallback(() => {
    clearGameLoop();
    startGame();
  }, [clearGameLoop, startGame]);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = nextDirectionRef.current || directionRef.current;
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    if (opposites[newDir] !== current) {
      nextDirectionRef.current = newDir;
    }
  }, []);

  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  const addCustomImage = useCallback((imageDataUrl: string) => {
    setCustomImages(prev => {
      const updated = [...prev, imageDataUrl];
      try {
        localStorage.setItem('snake-custom-images', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const removeCustomImage = useCallback((index: number) => {
    setCustomImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem('snake-custom-images', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const getAllLevelImages = useCallback(() => {
    return [...DEFAULT_LEVEL_IMAGES, ...customImages];
  }, [customImages]);

  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
    } else {
      clearGameLoop();
    }
    return clearGameLoop;
  }, [gameState, startGameLoop, clearGameLoop]);

  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
    }
  }, [activeEffects, gameState, startGameLoop]);

  return {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize: GRID_SIZE,
    lastEaten,
    powerUps,
    activeEffects,
    lives,
    level,
    revealedCells,
    customImages,
    allLevelImages: getAllLevelImages(),
    startGame,
    togglePause,
    restart,
    nextLevel,
    changeDirection,
    changeDifficulty,
    addCustomImage,
    removeCustomImage,
  };
}
