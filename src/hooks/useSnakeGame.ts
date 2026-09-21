import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type PowerUpType = 'slow' | 'shield' | 'life' | 'bonus';

export interface PowerUp {
  id: number;
  type: PowerUpType;
  position: Position;
  spawnTime: number;
  duration: number; // How long it stays on field
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

const POWERUP_DURATION = 8000; // Power-up stays on field for 8 seconds
const SLOW_EFFECT_DURATION = 5000; // Slow effect lasts 5 seconds
const SHIELD_EFFECT_DURATION = 6000; // Shield lasts 6 seconds
const POWERUP_SPAWN_CHANCE = 0.35; // 35% chance to spawn power-up after eating apple

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

  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction | null>(null);
  const gameStateRef = useRef<GameState>('idle');
  const snakeRef = useRef<Position[]>(getInitialSnake());
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activeEffectsRef = useRef<ActiveEffect[]>([]);
  const livesRef = useRef(1);
  const intervalRef = useRef<number | null>(null);
  const powerUpIdRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { powerUpsRef.current = powerUps; }, [powerUps]);
  useEffect(() => { activeEffectsRef.current = activeEffects; }, [activeEffects]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  const clearGameLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const hasEffect = useCallback((type: PowerUpType): boolean => {
    const now = Date.now();
    return activeEffectsRef.current.some(e => e.type === type && e.expiresAt > now);
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
    const types: PowerUpType[] = ['slow', 'shield', 'life', 'bonus'];
    const weights = [0.35, 0.3, 0.15, 0.2]; // Probability weights
    
    // Weighted random selection
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

    // Calculate new head position
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

    // Wrap around walls
    newHead = {
      x: (newHead.x + GRID_SIZE) % GRID_SIZE,
      y: (newHead.y + GRID_SIZE) % GRID_SIZE,
    };

    // Check self collision
    const willEat = newHead.x === currentFood.x && newHead.y === currentFood.y;
    const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
    const hitSelf = bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y);

    if (hitSelf) {
      // Check if shield is active
      if (hasEffect('shield')) {
        // Remove shield and continue
        setActiveEffects(prev => {
          const updated = prev.filter(e => e.type !== 'shield');
          activeEffectsRef.current = updated;
          return updated;
        });
      } else if (livesRef.current > 1) {
        // Use extra life
        setLives(prev => {
          const updated = prev - 1;
          livesRef.current = updated;
          return updated;
        });
        // Reset snake to initial position
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
        // Game over
        setGameState('gameover');
        clearGameLoop();
        return;
      }
    }

    // Build new snake
    const newSnake = [newHead, ...currentSnake];
    if (!willEat) {
      newSnake.pop();
    }

    // Update state
    setSnake(newSnake);
    snakeRef.current = newSnake;

    if (willEat) {
      const points = 10;
      const newScore = scoreRef.current + points;
      setScore(newScore);
      scoreRef.current = newScore;
      setLastEaten(Date.now());

      // Update high score
      setHighScore(prev => {
        if (newScore > prev) {
          try {
            localStorage.setItem('snake-high-score', String(newScore));
          } catch { /* ignore */ }
          return newScore;
        }
        return prev;
      });

      // Generate new food
      const newFood = getRandomPosition(newSnake);
      setFood(newFood);
      foodRef.current = newFood;

      // Chance to spawn power-up
      if (Math.random() < POWERUP_SPAWN_CHANCE) {
        spawnPowerUp();
      }
    } else {
      // Check if snake picked up a power-up
      const pickedUp = powerUpsRef.current.find(p => 
        p.position.x === newHead.x && p.position.y === newHead.y
      );

      if (pickedUp) {
        // Remove power-up from field
        setPowerUps(prev => {
          const updated = prev.filter(p => p.id !== pickedUp.id);
          powerUpsRef.current = updated;
          return updated;
        });

        // Apply effect
        switch (pickedUp.type) {
          case 'slow':
            addEffect('slow', SLOW_EFFECT_DURATION);
            break;
          case 'shield':
            addEffect('shield', SHIELD_EFFECT_DURATION);
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
            break;
        }
      }
    }

    // Clean up expired power-ups from field
    const now = Date.now();
    const expiredPowerUps = powerUpsRef.current.filter(p => now - p.spawnTime > p.duration);
    if (expiredPowerUps.length > 0) {
      setPowerUps(prev => {
        const updated = prev.filter(p => now - p.spawnTime <= p.duration);
        powerUpsRef.current = updated;
        return updated;
      });
    }

    // Clean up expired effects
    const expiredEffects = activeEffectsRef.current.filter(e => e.expiresAt <= now);
    if (expiredEffects.length > 0) {
      setActiveEffects(prev => {
        const updated = prev.filter(e => e.expiresAt > now);
        activeEffectsRef.current = updated;
        return updated;
      });
    }
  }, [clearGameLoop, hasEffect, addEffect, spawnPowerUp]);

  const startGameLoop = useCallback(() => {
    clearGameLoop();
    let speed = SPEED_MAP[difficulty];
    
    // Apply slow effect
    if (hasEffect('slow')) {
      speed = Math.floor(speed * 1.8);
    }
    
    intervalRef.current = window.setInterval(tick, speed);
  }, [difficulty, tick, clearGameLoop, hasEffect]);

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

  // Start/stop game loop based on game state and effects
  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
    } else {
      clearGameLoop();
    }
    return clearGameLoop;
  }, [gameState, startGameLoop, clearGameLoop]);

  // Restart game loop when effects change
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
    startGame,
    togglePause,
    restart,
    changeDirection,
    changeDifficulty,
  };
}
