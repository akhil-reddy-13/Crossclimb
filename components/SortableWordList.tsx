'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Game } from '@/types/game';
import Word, { WordRef } from './Word';
import Icon from './Icon';
import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react';

interface SortableWordListProps {
  game: Game;
  gameStatus: 'idle' | 'error' | 'unsorted' | 'sorted' | 'solved';
  onReorder: (fromIndex: number, toIndex: number) => void;
  onWordChange: (index: number, text: string) => void;
  onTopEdgeChange: (letters: string[]) => void;
  onBottomEdgeChange: (letters: string[]) => void;
  onFocusedChange: (index: number | null) => void;
  onLastKeydown: (index: number) => void;
  isReadonly?: boolean;
  focusedIndex: number | null;
  isUnlocking?: boolean;
}

interface SortableItemProps {
  id: string;
  word: { correct: string; hint: string; current: string };
  index: number;
  isFinal: boolean;
  isLocked: boolean;
  isReadonly: boolean;
  focusedIndex: number | null;
  isHighlighted: boolean;
  onWordChange: (letters: string[]) => void;
  onFocusedChange: (index: number) => void;
  onLastKeydown: () => void;
  wordRef?: React.RefObject<WordRef>;
  setWordRef?: (ref: WordRef | null) => void;
}

function SortableItem({
  id,
  word,
  index,
  isFinal,
  isLocked,
  isReadonly,
  focusedIndex,
  isHighlighted,
  onWordChange,
  onFocusedChange,
  onLastKeydown,
  wordRef,
  setWordRef,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const letters = word.current.split('');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1"
    >
      <div className="flex flex-col items-center text-gray-400 text-xs mr-1">
        <span>=</span>
        <span>=</span>
        <span>=</span>
        <span>=</span>
        <span>=</span>
      </div>
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400"
      >
        <Icon icon="bars" />
      </div>
      <div className="flex-1">
        <Word
          ref={(ref) => {
            if (wordRef) {
              (wordRef as React.MutableRefObject<WordRef | null>).current = ref;
            }
            if (setWordRef) {
              setWordRef(ref);
            }
          }}
          letters={letters}
          isReadonly={isReadonly}
          isFinal={isFinal}
          isLocked={isLocked}
          isHighlighted={isHighlighted}
          correctWord={word.correct}
          onLettersChange={onWordChange}
          onFocusedChange={(idx) => onFocusedChange(index)}
          onLastKeydown={onLastKeydown}
        />
      </div>
      <div className="flex flex-col items-center text-gray-400 text-xs ml-1">
        <span>=</span>
        <span>=</span>
        <span>=</span>
        <span>=</span>
        <span>=</span>
      </div>
    </div>
  );
}

export interface SortableWordListRef {
  focusFirstWord: () => void;
  focusTopEdge: () => void;
  focusBottomEdge: () => void;
  focusWord: (index: number) => void;
}

const SortableWordList = forwardRef<SortableWordListRef, SortableWordListProps>(({
  game,
  gameStatus,
  onReorder,
  onWordChange,
  onTopEdgeChange,
  onBottomEdgeChange,
  onFocusedChange,
  onLastKeydown,
  isReadonly = false,
  focusedIndex,
  isUnlocking = false,
}, ref) => {
  const firstWordRef = useRef<WordRef>(null);
  const topEdgeRef = useRef<WordRef>(null);
  const bottomEdgeRef = useRef<WordRef>(null);
  const wordRefs = useRef<(WordRef | null)[]>([]);

  useImperativeHandle(ref, () => ({
    focusFirstWord: () => {
      if (firstWordRef.current && game.words.length > 0) {
        setTimeout(() => {
          firstWordRef.current?.focus(0);
        }, 100);
      }
    },
    focusTopEdge: () => {
      if (topEdgeRef.current) {
        setTimeout(() => {
          topEdgeRef.current?.focus(0);
        }, 100);
      }
    },
    focusBottomEdge: () => {
      if (bottomEdgeRef.current) {
        setTimeout(() => {
          bottomEdgeRef.current?.focus(0);
        }, 100);
      }
    },
    focusWord: (index: number) => {
      const wordRef = wordRefs.current[index];
      if (wordRef) {
        setTimeout(() => {
          wordRef.focus(0);
        }, 100);
      }
    },
  }));
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over.id as string);
      onReorder(oldIndex, newIndex);
    }
  };

  // Adjust focused index: 0 = top edge, 1-5 = middle words, 6 = bottom edge
  const getActualFocusedIndex = (index: number) => {
    return index + 1; // Middle words start at index 1
  };

  // Auto-advance to next word when last letter is typed
  const handleLastKeydown = (index: number) => {
    // If this is a middle word, advance to next middle word
    if (index < game.words.length - 1) {
      setTimeout(() => {
        const nextWordRef = wordRefs.current[index + 1];
        if (nextWordRef) {
          nextWordRef.focus(0);
          onFocusedChange(getActualFocusedIndex(index + 1));
        }
      }, 50);
    } else if (gameStatus === 'sorted') {
      // If this is the last middle word and we're sorted, advance to top edge
      setTimeout(() => {
        if (topEdgeRef.current) {
          topEdgeRef.current.focus(0);
          onFocusedChange(0);
        }
      }, 50);
    }
  };

  // Auto-advance from top edge to bottom edge when top edge is complete
  const handleTopEdgeLastKeydown = () => {
    if (gameStatus === 'sorted') {
      setTimeout(() => {
        if (bottomEdgeRef.current) {
          bottomEdgeRef.current.focus(0);
          onFocusedChange(game.words.length + 1);
        }
      }, 50);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* Top edge word */}
      <div className={`mb-1 transition-all duration-500 ${isUnlocking ? 'animate-pulse' : ''}`}>
        <Word
          ref={topEdgeRef}
          letters={game.currentEdgeWords[0].split('')}
          isReadonly={isReadonly || gameStatus !== 'sorted'}
          isFinal={true}
          isLocked={gameStatus !== 'sorted' && gameStatus !== 'solved'}
          isUnlocking={isUnlocking}
          onLettersChange={onTopEdgeChange}
          onFocusedChange={() => onFocusedChange(0)}
          onLastKeydown={handleTopEdgeLastKeydown}
        />
      </div>

      {/* Middle words */}
      <SortableContext
        items={game.words.map((_, i) => i.toString())}
        strategy={verticalListSortingStrategy}
      >
        {game.words.map((word, index) => {
          const actualIndex = getActualFocusedIndex(index);
          return (
            <SortableItem
              key={index}
              id={index.toString()}
              word={word}
              index={index}
              isFinal={false}
              isLocked={false}
              isReadonly={isReadonly}
              focusedIndex={focusedIndex}
              isHighlighted={focusedIndex === actualIndex}
              onWordChange={(letters) =>
                onWordChange(index, letters.join(''))
              }
              onFocusedChange={(idx) =>
                onFocusedChange(actualIndex)
              }
              onLastKeydown={() => handleLastKeydown(index)}
              wordRef={index === 0 ? firstWordRef : undefined}
              setWordRef={(ref) => {
                if (ref) {
                  wordRefs.current[index] = ref;
                }
              }}
            />
          );
        })}
      </SortableContext>

      {/* Bottom edge word */}
      <div className={`mt-1 transition-all duration-500 ${isUnlocking ? 'animate-pulse' : ''}`}>
        <Word
          ref={bottomEdgeRef}
          letters={game.currentEdgeWords[1].split('')}
          isReadonly={isReadonly || gameStatus !== 'sorted'}
          isFinal={true}
          isLocked={gameStatus !== 'sorted' && gameStatus !== 'solved'}
          isUnlocking={isUnlocking}
          onLettersChange={onBottomEdgeChange}
          onFocusedChange={() =>
            onFocusedChange(game.words.length + 1)
          }
        />
      </div>
    </DndContext>
  );
});

SortableWordList.displayName = 'SortableWordList';

export default SortableWordList;

