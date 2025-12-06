/**
 * DraggableCard Component
 * Wrapper for sortable drag-and-drop cards
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@hai3/uikit';
import { GripVertical } from 'lucide-react';

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  children,
  className = '',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-muted transition-colors z-10"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </Card>
  );
};
