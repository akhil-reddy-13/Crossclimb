'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface WordRef {
  focus: (letterIndex?: number) => void;
}

interface WordProps {
  letters: string[];
  isReadonly?: boolean;
  isFinal?: boolean;
  isLocked?: boolean;
  isHighlighted?: boolean;
  correctWord?: string;
  isUnlocking?: boolean;
  onLettersChange?: (letters: string[]) => void;
  onFocusedChange?: (index: number | null) => void;
  onLastKeydown?: () => void;
}

const Word = forwardRef<WordRef, WordProps>(({
  letters,
  isReadonly = false,
  isFinal = false,
  isLocked = false,
  isHighlighted = false,
  correctWord,
  isUnlocking = false,
  onLettersChange,
  onFocusedChange,
  onLastKeydown,
}, ref) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleKeydown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isReadonly || isLocked) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Tab') {
      return;
    }

    // Handle left/right arrow navigation
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        focus(index - 1);
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < letters.length - 1) {
        focus(index + 1);
      }
      return;
    }

    const currentLetter = letters[index] || ' ';
    const isLetter = /^[a-zA-Z]$/.test(e.key);
    const letter = e.key.toUpperCase();
    const previousLetter = currentLetter.toUpperCase();

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (e.key === 'Backspace' && currentLetter === ' ') {
        focus(index - 1);
      }
      const newLetters = letters.map((l, i) => (i === index ? ' ' : l));
      onLettersChange?.(newLetters);
      return;
    }

    e.preventDefault();

    if (isLetter && letter !== previousLetter) {
      const newLetters = letters.map((l, i) => (i === index ? letter : l));
      onLettersChange?.(newLetters);

      // Check if word is complete (all letters filled)
      const isComplete = newLetters.every(l => l !== ' ' && l !== '');
      
      if (index === letters.length - 1 || isComplete) {
        // If this is the last letter or word is complete, trigger last keydown
        setTimeout(() => {
          onLastKeydown?.();
        }, 10);
      } else {
        focus(index + 1);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    onFocusedChange?.(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
    onFocusedChange?.(null);
  };

  useImperativeHandle(ref, () => ({
    focus: (letterIndex = 0) => {
      if (!isLocked && !isReadonly) {
        focus(letterIndex);
        handleFocus(letterIndex);
      }
    },
  }));

  return (
    <div className={`relative flex justify-evenly rounded-lg p-3 transition-all duration-500 ${
      isFinal && !isLocked ? 'bg-[#FFCBA4]' : 
      isLocked ? 'bg-[#FFCBA4]' :
      isHighlighted ? 'bg-blue-200' :
      'bg-white'
    } ${isLocked ? 'opacity-100' : ''}`}>
      {letters.map((letter, i) => (
        <div key={i} className="relative w-8">
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            className={`border-none bg-transparent w-full text-center outline-none p-0 font-bold text-black relative z-10 ${
              letter === ' ' ? 'text-transparent' : ''
            }`}
            value={letter === ' ' ? '' : letter}
            readOnly={isReadonly || isLocked}
            onKeyDown={(e) => handleKeydown(i, e)}
            onFocus={() => handleFocus(i)}
            onBlur={handleBlur}
            maxLength={1}
            style={{ 
              caretColor: 'black',
              cursor: isReadonly || isLocked ? 'default' : 'text'
            }}
          />
          {(letter === ' ' || letter === '') && !isReadonly && !isLocked && focusedIndex !== i && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-black text-xl font-bold">_</span>
            </div>
          )}
        </div>
      ))}
      {isLocked && (
        <div className={`absolute inset-0 flex items-center justify-center bg-transparent ${isUnlocking ? 'animate-fade-out' : ''}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 384 512"
            className="h-4 w-4 text-gray-600"
          >
            <path
              fill="currentColor"
              d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

Word.displayName = 'Word';

export default Word;

