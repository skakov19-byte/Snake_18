import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';
export type Difficulty = 'easy' | 'medium' | 'hard';

const GRID_SIZE = 20;

const SPEED_MAP: Record<Difficulty, number> = {
  easy: 180,
  medium: 120,
  hard: 75,
};

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
  const [lastEaten, setLastEaten] = useState<number>(0);

  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction | null>(null);
  const gameStateRef = useRef<GameState>('idle');
  const snakeRef = useRef<Position[]>(getInitialSnake());
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  // Keep refs in sync
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const clearGameLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      setGameState('gameover');
      clearGameLoop();
      return;
    }

    // Check self collision (exclude tail since it will move)
    const willEat = newHead.x === currentFood.x && newHead.y === currentFood.y;
    const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
    if (bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      setGameState('gameover');
      clearGameLoop();
      return;
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
      const newScore = scoreRef.current + 10;
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
    }
  }, [clearGameLoop]);

  const startGameLoop = useCallback(() => {
    clearGameLoop();
    const speed = SPEED_MAP[difficulty];
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

  // Start/stop game loop based on game state
  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
    } else {
      clearGameLoop();
    }
    return clearGameLoop;
  }, [gameState, startGameLoop, clearGameLoop]);

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
    startGame,
    togglePause,
    restart,
    changeDirection,
    changeDifficulty,
  };
}
