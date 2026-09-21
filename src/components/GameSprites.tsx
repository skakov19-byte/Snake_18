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
