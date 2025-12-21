import { useState, useEffect, useRef, useCallback } from 'react';
import { clamp } from 'lodash';
import { eventBus } from '@hai3/react';
import type { Position, Size } from '../types';
import { loadStudioState } from '../utils/persistence';
import { STORAGE_KEYS } from '../types';
import { StudioEvents } from '../events/studioEvents';

interface UseDraggableProps {
  panelSize: Size;
  storageKey?: string;
}

export const useDraggable = ({ panelSize, storageKey = STORAGE_KEYS.POSITION }: UseDraggableProps) => {
  // Calculate default position (bottom-right with margin)
  const getDefaultPosition = (): Position => ({
    x: window.innerWidth - panelSize.width - 20,
    y: window.innerHeight - panelSize.height - 20,
  });

  const [position, setPosition] = useState<Position>(() =>
    loadStudioState(storageKey, getDefaultPosition())
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = clamp(
        e.clientX - dragStartPos.current.x,
        0,
        window.innerWidth - panelSize.width
      );
      const newY = clamp(
        e.clientY - dragStartPos.current.y,
        0,
        window.innerHeight - panelSize.height
      );

      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);

      // Emit appropriate event based on storage key
      const eventName = storageKey === STORAGE_KEYS.BUTTON_POSITION
        ? StudioEvents.ButtonPositionChanged
        : StudioEvents.PositionChanged;
      eventBus.emit(eventName, { position: newPosition });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, panelSize.width, panelSize.height, storageKey]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
};
