import React from 'react';
import { Direction } from '../hooks/useSnakeGame';

interface SnakeHeadProps {
  direction: Direction;
}

const rotationMap: Record<Direction, number> = {
  RIGHT: 0,
  DOWN: 90,
  LEFT: 180,
  UP: 270,
};

export const SnakeHead: React.FC<SnakeHeadProps> = ({ direction }) => {
  const rotation = rotationMap[direction];
  
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Head shape */}
      <ellipse cx="50" cy="50" rx="42" ry="38" fill="#22c55e" />
      <ellipse cx="50" cy="50" rx="42" ry="38" fill="url(#headGradient)" />
      
      {/* Scale pattern */}
      <ellipse cx="35" cy="40" rx="8" ry="6" fill="#16a34a" opacity="0.4" />
      <ellipse cx="55" cy="35" rx="7" ry="5" fill="#16a34a" opacity="0.3" />
      <ellipse cx="45" cy="55" rx="9" ry="6" fill="#16a34a" opacity="0.3" />
      <ellipse cx="60" cy="50" rx="6" ry="5" fill="#16a34a" opacity="0.4" />
      
      {/* Eyes */}
      <ellipse cx="65" cy="35" rx="10" ry="11" fill="white" />
      <ellipse cx="65" cy="65" rx="10" ry="11" fill="white" />
      <circle cx="68" cy="35" r="5" fill="#1a1a1a" />
      <circle cx="68" cy="65" r="5" fill="#1a1a1a" />
      <circle cx="70" cy="33" r="2" fill="white" />
      <circle cx="70" cy="63" r="2" fill="white" />
      
      {/* Tongue */}
      <path
        d="M 88 47 L 98 44 M 88 53 L 98 56 M 88 50 L 95 50"
        stroke="#ef4444"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Nostrils */}
      <circle cx="82" cy="44" r="2" fill="#15803d" />
      <circle cx="82" cy="56" r="2" fill="#15803d" />
      
      <defs>
        <radialGradient id="headGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const SnakeBody: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const opacity = 1 - (index / total) * 0.3;
  const scale = 1 - (index / total) * 0.15;
  
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ opacity, transform: `scale(${scale})` }}
    >
      <ellipse cx="50" cy="50" rx="38" ry="38" fill="#22c55e" />
      <ellipse cx="50" cy="50" rx="38" ry="38" fill="url(#bodyGradient)" />
      
      {/* Scale pattern */}
      <ellipse cx="40" cy="40" rx="10" ry="8" fill="#16a34a" opacity="0.4" />
      <ellipse cx="60" cy="55" rx="9" ry="7" fill="#16a34a" opacity="0.35" />
      <ellipse cx="50" cy="60" rx="8" ry="6" fill="#16a34a" opacity="0.3" />
      <ellipse cx="55" cy="38" rx="7" ry="6" fill="#16a34a" opacity="0.3" />
      
      {/* Center line */}
      <line x1="20" y1="50" x2="80" y2="50" stroke="#15803d" strokeWidth="2" opacity="0.3" />
      
      <defs>
        <radialGradient id="bodyGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const SnakeTail: React.FC = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ opacity: 0.7 }}>
      <ellipse cx="50" cy="50" rx="30" ry="30" fill="#22c55e" />
      <ellipse cx="50" cy="50" rx="30" ry="30" fill="url(#tailGradient)" />
      <ellipse cx="45" cy="45" rx="8" ry="6" fill="#16a34a" opacity="0.3" />
      
      <defs>
        <radialGradient id="tailGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const Apple: React.FC = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
      {/* Apple body */}
      <ellipse cx="50" cy="55" rx="35" ry="33" fill="#ef4444" />
      <ellipse cx="50" cy="55" rx="35" ry="33" fill="url(#appleGradient)" />
      
      {/* Highlight */}
      <ellipse cx="38" cy="45" rx="12" ry="10" fill="white" opacity="0.25" />
      
      {/* Indent at top */}
      <path d="M 42 25 Q 50 30 58 25" stroke="#dc2626" strokeWidth="3" fill="none" />
      
      {/* Stem */}
      <path d="M 50 25 Q 52 15 48 10" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Leaf */}
      <ellipse cx="58" cy="18" rx="10" ry="5" fill="#22c55e" transform="rotate(-30 58 18)" />
      <path d="M 52 20 Q 58 18 64 16" stroke="#16a34a" strokeWidth="1" fill="none" />
      
      <defs>
        <radialGradient id="appleGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="0" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0.3" />
        </radialGradient>
      </defs>
    </svg>
  );
};

// Power-up: Slow Motion (turtle icon)
export const SlowPowerUp: React.FC = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce">
      {/* Glow */}
      <circle cx="50" cy="50" r="45" fill="#3b82f6" opacity="0.2" />
      <circle cx="50" cy="50" r="38" fill="#1e40af" opacity="0.3" />
      
      {/* Shell */}
      <ellipse cx="50" cy="55" rx="30" ry="25" fill="#0ea5e9" />
      <ellipse cx="50" cy="55" rx="30" ry="25" fill="url(#slowGradient)" />
      
      {/* Shell pattern */}
      <path d="M 35 45 Q 50 35 65 45" stroke="#0369a1" strokeWidth="2" fill="none" />
      <path d="M 30 55 Q 50 45 70 55" stroke="#0369a1" strokeWidth="2" fill="none" />
      <path d="M 35 65 Q 50 55 65 65" stroke="#0369a1" strokeWidth="2" fill="none" />
      
      {/* Head */}
      <ellipse cx="78" cy="55" rx="10" ry="8" fill="#7dd3fc" />
      <circle cx="82" cy="53" r="2" fill="#0c4a6e" />
      
      {/* Legs */}
      <ellipse cx="35" cy="72" rx="5" ry="4" fill="#7dd3fc" />
      <ellipse cx="65" cy="72" rx="5" ry="4" fill="#7dd3fc" />
      
      {/* Clock symbol */}
      <circle cx="50" cy="55" r="8" fill="white" opacity="0.8" />
      <line x1="50" y1="55" x2="50" y2="49" stroke="#0c4a6e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="55" x2="55" y2="55" stroke="#0c4a6e" strokeWidth="1.5" strokeLinecap="round" />
      
      <defs>
        <radialGradient id="slowGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};



// Power-up: Extra Life (heart)
export const LifePowerUp: React.FC = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce">
      {/* Glow */}
      <circle cx="50" cy="50" r="45" fill="#ec4899" opacity="0.2" />
      
      {/* Heart shape */}
      <path
        d="M 50 85 C 20 65 10 45 20 30 C 25 20 40 18 50 30 C 60 18 75 20 80 30 C 90 45 80 65 50 85 Z"
        fill="#f43f5e"
        stroke="#be123c"
        strokeWidth="2"
      />
      <path
        d="M 50 85 C 20 65 10 45 20 30 C 25 20 40 18 50 30 C 60 18 75 20 80 30 C 90 45 80 65 50 85 Z"
        fill="url(#lifeGradient)"
      />
      
      {/* Highlight */}
      <ellipse cx="35" cy="35" rx="8" ry="10" fill="white" opacity="0.3" />
      
      {/* Plus sign */}
      <rect x="46" y="40" width="8" height="24" rx="2" fill="white" opacity="0.9" />
      <rect x="38" y="48" width="24" height="8" rx="2" fill="white" opacity="0.9" />
      
      <defs>
        <radialGradient id="lifeGradient" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

// Power-up: Bonus Apple (golden)
export const BonusApple: React.FC = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
      {/* Glow */}
      <circle cx="50" cy="55" r="42" fill="#fbbf24" opacity="0.3" />
      
      {/* Apple body */}
      <ellipse cx="50" cy="55" rx="35" ry="33" fill="#fbbf24" />
      <ellipse cx="50" cy="55" rx="35" ry="33" fill="url(#bonusGradient)" />
      
      {/* Highlight */}
      <ellipse cx="38" cy="45" rx="12" ry="10" fill="white" opacity="0.4" />
      
      {/* Indent at top */}
      <path d="M 42 25 Q 50 30 58 25" stroke="#d97706" strokeWidth="3" fill="none" />
      
      {/* Stem */}
      <path d="M 50 25 Q 52 15 48 10" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Leaf */}
      <ellipse cx="58" cy="18" rx="10" ry="5" fill="#22c55e" transform="rotate(-30 58 18)" />
      
      {/* Star sparkle */}
      <path d="M 65 40 L 67 35 L 69 40 L 74 42 L 69 44 L 67 49 L 65 44 L 60 42 Z" fill="white" opacity="0.9" />
      
      <defs>
        <radialGradient id="bonusGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0.3" />
        </radialGradient>
      </defs>
    </svg>
  );
};
