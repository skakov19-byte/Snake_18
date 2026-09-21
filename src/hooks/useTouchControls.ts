import { useEffect, useRef, useCallback } from 'react';
import { Direction } from './useSnakeGame';

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

export function useTouchControls(
  onDirection: (dir: Direction) => void,
  enabled: boolean
) {
  const touchRef = useRef<TouchState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchRef.current.startX;
    const deltaY = touch.clientY - touchRef.current.startY;
    const elapsed = Date.now() - touchRef.current.startTime;

    const minSwipeDistance = 30;
    const maxSwipeTime = 500;

    if (elapsed > maxSwipeTime) {
      touchRef.current = null;
      return;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < minSwipeDistance) {
      touchRef.current = null;
      return;
    }

    if (absX > absY) {
      // Horizontal swipe
      onDirection(deltaX > 0 ? 'RIGHT' : 'LEFT');
    } else {
      // Vertical swipe
      onDirection(deltaY > 0 ? 'DOWN' : 'UP');
    }

    touchRef.current = null;
    e.preventDefault();
  }, [enabled, onDirection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return containerRef;
}
