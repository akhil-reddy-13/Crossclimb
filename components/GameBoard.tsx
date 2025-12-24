'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGame';
import SortableWordList, { SortableWordListRef } from './SortableWordList';
import CompletionScreen from './CompletionScreen';
import { GameInfo } from '@/types/game';

interface GameBoardProps {
  gameInfo: GameInfo;
  onBack: () => void;
}

export default function GameBoard({ gameInfo, onBack }: GameBoardProps) {
  const {
    game,
    focusedIndex,
    setFocusedIndex,
    wordLength,
    gameStatus,
    currentHint,
    initGame,
    replaceWord,
    replaceTop,
    replaceBottom,
    reorderWord,
    getElapsedTime,
  } = useGame();

  const hasAutoFocused = useRef(false);
  const wordListRef = useRef<SortableWordListRef>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const prevGameStatus = useRef(gameStatus);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintCooldown, setHintCooldown] = useState(0);
  const [revealCooldown, setRevealCooldown] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (gameInfo) {
      initGame(gameInfo);
      hasAutoFocused.current = false;
    }
  }, [gameInfo, initGame]);

  // Auto-focus first word when game starts
  useEffect(() => {
    if (game && gameStatus === 'error' && !hasAutoFocused.current && wordListRef.current) {
      // Focus first word after a short delay
      setTimeout(() => {
        wordListRef.current?.focusFirstWord();
        setFocusedIndex(1); // Index 1 is the first middle word
        hasAutoFocused.current = true;
      }, 200);
    }
  }, [game, gameStatus, setFocusedIndex]);

  // Timer
  useEffect(() => {
    if (!game || gameStatus === 'solved') return;
    
    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 100);

    return () => clearInterval(interval);
  }, [game, gameStatus, getElapsedTime]);

  // Cooldown timers
  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => setHintCooldown(hintCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [hintCooldown]);

  useEffect(() => {
    if (revealCooldown > 0) {
      const timer = setTimeout(() => setRevealCooldown(revealCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [revealCooldown]);

  // Auto-focus top edge case when transitioning from unsorted to sorted
  useEffect(() => {
    if (game && prevGameStatus.current === 'unsorted' && gameStatus === 'sorted') {
      // Trigger unlock animation
      setIsUnlocking(true);
      setTimeout(() => {
        setIsUnlocking(false);
        // Wait for unlock animation, then focus top edge case
        setTimeout(() => {
          setFocusedIndex(0); // Index 0 is the top edge word
          wordListRef.current?.focusTopEdge();
        }, 300);
      }, 500);
    }
    prevGameStatus.current = gameStatus;
  }, [gameStatus, game, setFocusedIndex]);

  const handleWordChange = (index: number, text: string) => {
    replaceWord(index, text);
  };

  const handleTopEdgeChange = (letters: string[]) => {
    replaceTop(letters.join(''));
  };

  const handleBottomEdgeChange = (letters: string[]) => {
    replaceBottom(letters.join(''));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHint = useCallback(() => {
    if (!game || hintCooldown > 0 || focusedIndex === null || focusedIndex === 0 || focusedIndex === game.words.length + 1) return;
    
    const wordIndex = focusedIndex - 1;
    const currentWord = game.words[wordIndex];
    const correctWord = currentWord.correct;
    const currentLetters = currentWord.current.split('');
    
    // Find the first incorrect or empty position
    let targetIndex = 0;
    for (let i = 0; i < correctWord.length; i++) {
      if (currentLetters[i] === ' ' || currentLetters[i] !== correctWord[i]) {
        targetIndex = i;
        break;
      }
    }
    
    // Check if word is completely wrong (all letters filled but all wrong)
    const isCompletelyWrong = currentLetters.every((l, i) => l !== ' ' && l !== '') && 
                               currentLetters.every((l, i) => l !== correctWord[i]);
    
    if (isCompletelyWrong) {
      // Strikethrough animation - clear word, then fill first letter
      replaceWord(wordIndex, ' '.repeat(correctWord.length));
      setTimeout(() => {
        const newLetters = ' '.repeat(correctWord.length).split('');
        newLetters[0] = correctWord[0];
        replaceWord(wordIndex, newLetters.join(''));
        // Focus the first letter
        setTimeout(() => {
          wordListRef.current?.focusWord(wordIndex);
        }, 100);
      }, 300);
    } else {
      // Just fill in the next letter
      const newLetters = [...currentLetters];
      newLetters[targetIndex] = correctWord[targetIndex];
      replaceWord(wordIndex, newLetters.join(''));
      
      // Focus the letter we just filled
      setTimeout(() => {
        wordListRef.current?.focusWord(wordIndex);
      }, 100);
    }
    
    setHintCooldown(10);
  }, [game, focusedIndex, hintCooldown, replaceWord]);

  const handleRevealRow = useCallback(() => {
    if (!game || revealCooldown > 0 || focusedIndex === null || focusedIndex === 0 || focusedIndex === game.words.length + 1) return;
    
    const wordIndex = focusedIndex - 1;
    const correctWord = game.words[wordIndex].correct;
    
    // Fill in the entire word
    replaceWord(wordIndex, correctWord);
    
    // Auto-advance to next word
    setTimeout(() => {
      if (wordIndex < game.words.length - 1) {
        setFocusedIndex(focusedIndex + 1);
        wordListRef.current?.focusWord(wordIndex + 1);
      } else {
        // If last word, advance to top edge if sorted
        if (gameStatus === 'sorted') {
          setFocusedIndex(0);
          wordListRef.current?.focusTopEdge();
        }
      }
    }, 100);
    
    setRevealCooldown(20);
  }, [game, focusedIndex, revealCooldown, gameStatus, replaceWord]);

  const handleNavigateUp = useCallback(() => {
    if (!game) return;
    if (focusedIndex === null) {
      setFocusedIndex(game.words.length);
      return;
    }
    if (focusedIndex === 0) return; // Already at top
    if (focusedIndex === game.words.length + 1) {
      // From bottom edge, go to last middle word
      setFocusedIndex(game.words.length);
      wordListRef.current?.focusWord(game.words.length - 1);
    } else if (focusedIndex > 0 && focusedIndex <= game.words.length) {
      // From middle word, go to previous
      const newIndex = focusedIndex - 1;
      setFocusedIndex(newIndex);
      if (newIndex === 0) {
        wordListRef.current?.focusTopEdge();
      } else {
        wordListRef.current?.focusWord(newIndex - 1);
      }
    }
  }, [game, focusedIndex, setFocusedIndex]);

  const handleNavigateDown = useCallback(() => {
    if (!game) return;
    if (focusedIndex === null) {
      setFocusedIndex(1);
      wordListRef.current?.focusFirstWord();
      return;
    }
    if (focusedIndex === game.words.length + 1) return; // Already at bottom
    if (focusedIndex === 0) {
      // From top edge, go to first middle word
      setFocusedIndex(1);
      wordListRef.current?.focusFirstWord();
    } else if (focusedIndex > 0 && focusedIndex <= game.words.length) {
      // From middle word, go to next
      const newIndex = focusedIndex + 1;
      setFocusedIndex(newIndex);
      if (newIndex > game.words.length) {
        wordListRef.current?.focusBottomEdge();
      } else {
        wordListRef.current?.focusWord(newIndex - 1);
      }
    }
  }, [game, focusedIndex, setFocusedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!currentHint) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNavigateUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNavigateDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentHint, handleNavigateUp, handleNavigateDown]);

  if (gameStatus === 'solved' && game) {
    return (
      <CompletionScreen
        game={game}
        time={getElapsedTime()}
        onBack={onBack}
      />
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1f1f]">
        <div className="text-white">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] p-4 relative">
      {/* Question Mark Button - Fixed at top right of page */}
      <button
        onClick={() => setShowInstructions(true)}
        className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#0077B5] hover:bg-[#006399] text-white text-lg font-bold transition-colors z-50 shadow-lg"
      >
        ?
      </button>

      {/* Timer */}
      <div className="text-center mb-4">
        <div className="text-white text-2xl font-mono font-bold">
          {formatTime(elapsedTime)}
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-4">

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInstructions(false)}>
            <div className="bg-[#212121] rounded-lg p-6 max-w-md mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">How to Play</h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>1. Guess the answer to each clue by typing in the word boxes.</p>
                <p>2. Reorder the rows to form a word ladder, where each word differs by one letter.</p>
                <p>3. Once sorted correctly, the top and bottom words will unlock. Guess those to complete the puzzle!</p>
                <p className="text-xs text-gray-400 mt-4">Tip: You can solve the entire puzzle just by typing - no need to click around!</p>
              </div>
            </div>
          </div>
        )}

        {/* Word List */}
        <div className="space-y-1 mt-8">
          <SortableWordList
            ref={wordListRef}
            game={game}
            gameStatus={gameStatus}
            onReorder={reorderWord}
            onWordChange={handleWordChange}
            onTopEdgeChange={handleTopEdgeChange}
            onBottomEdgeChange={handleBottomEdgeChange}
            onFocusedChange={setFocusedIndex}
            onLastKeydown={(index) => {
              // Auto-focus next word if applicable
            }}
            focusedIndex={focusedIndex}
            isUnlocking={isUnlocking}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={handleRevealRow}
            disabled={revealCooldown > 0 || focusedIndex === null || focusedIndex === 0 || focusedIndex === (game?.words.length || 0) + 1 || gameStatus === 'sorted' || gameStatus === 'solved'}
            className={`px-5 py-2 border border-[#005885] rounded-full text-sm font-medium transition-colors ${
              revealCooldown > 0 || gameStatus === 'sorted' || gameStatus === 'solved'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {revealCooldown > 0 ? `Reveal row (${revealCooldown}s)` : 'Reveal row'}
          </button>
          <button 
            onClick={handleHint}
            disabled={hintCooldown > 0 || focusedIndex === null || focusedIndex === 0 || focusedIndex === (game?.words.length || 0) + 1 || gameStatus === 'sorted' || gameStatus === 'solved'}
            className={`px-5 py-2 border border-[#005885] rounded-full text-sm font-medium transition-colors ${
              hintCooldown > 0 || gameStatus === 'sorted' || gameStatus === 'solved'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {hintCooldown > 0 ? `Hint (${hintCooldown}s)` : 'Hint'}
          </button>
        </div>

        {/* Clue Display at Bottom */}
        {currentHint && (
          <div className="bg-[#2d2d2d] rounded-lg px-4 py-3 mt-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleNavigateUp}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="text-white text-sm flex-1 text-center mx-4">{currentHint}</span>
              <button 
                onClick={handleNavigateDown}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

