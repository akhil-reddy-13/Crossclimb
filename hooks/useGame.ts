'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Game, GameStatus, GameInfo } from '@/types/game';
import { differByOne } from '@/utils/wordLadder';

export function useGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const wordLength = useMemo(() => game?.edgeWords[0].length || 0, [game]);

  const gameStatus = useMemo((): GameStatus => {
    if (!game) return 'idle';

    const isHalfSolved = game.words.every((word) => word.correct.toUpperCase() === word.current.toUpperCase());

    if (!isHalfSolved) return 'error';

    const isSorted =
      isHalfSolved &&
      game.words.every(
        (word, i) =>
          i === game.words.length - 1 ||
          differByOne(word.current, game.words[i + 1].current)
      );

    if (!isSorted) return 'unsorted';

    const isSolved =
      isHalfSolved &&
      isSorted &&
      game.currentEdgeWords.every((word, i) =>
        game.edgeWords.some((ew) => ew.toUpperCase() === word.toUpperCase())
      ) &&
      differByOne(game.currentEdgeWords[0], game.words[0].current) &&
      differByOne(
        game.currentEdgeWords[1],
        game.words[game.words.length - 1].current
      );

    if (!isSolved) return 'sorted';
    return 'solved';
  }, [game]);

  const currentHint = useMemo(() => {
    if (gameStatus === 'solved') return 'Solved!';
    if (gameStatus === 'sorted')
      return `Top + bottom: ${game?.edgeHint || ''}`;
    if (gameStatus === 'unsorted') return 'Sort the rows!';
    if (focusedIndex === null || !game) return undefined;

    // Adjust focused index for edge words
    // 0 = top edge, 1-5 = middle words, 6 = bottom edge
    if (focusedIndex === 0) {
      return undefined; // Edge words are only accessible when sorted
    }
    if (focusedIndex === game.words.length + 1) {
      return undefined; // Edge words are only accessible when sorted
    }

    return game.words[focusedIndex - 1]?.hint;
  }, [gameStatus, focusedIndex, game]);

  const initGame = useCallback((gameInfo: GameInfo) => {
    const emptyString = Array(gameInfo.edgeWords[0].length)
      .fill(' ')
      .join('');

    const shuffledWords = [...gameInfo.words].sort(() => Math.random() - 0.5);

    setGame({
      ...gameInfo,
      words: shuffledWords.map((word) => ({
        ...word,
        current: emptyString,
      })),
      currentEdgeWords: [emptyString, emptyString],
      startTime: Date.now(),
    });

    setStartTime(Date.now());
  }, []);

  const replaceWord = useCallback((index: number, text: string) => {
    setGame((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        words: prev.words.map((word, i) =>
          i === index ? { ...word, current: text } : word
        ),
      };
    });
  }, []);

  const replaceTop = useCallback((word: string) => {
    setGame((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentEdgeWords: [word, prev.currentEdgeWords[1]],
      };
    });
  }, []);

  const replaceBottom = useCallback((word: string) => {
    setGame((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentEdgeWords: [prev.currentEdgeWords[0], word],
      };
    });
  }, []);

  const reorderWord = useCallback((fromIndex: number, toIndex: number) => {
    setGame((prev) => {
      if (!prev) return prev;
      const newWords = [...prev.words];
      const [removed] = newWords.splice(fromIndex, 1);
      newWords.splice(toIndex, 0, removed);
      return {
        ...prev,
        words: newWords,
      };
    });
  }, []);

  // Check if game is solved and set end time
  useEffect(() => {
    if (gameStatus === 'solved' && game && !game.endTime) {
      setGame((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          endTime: Date.now(),
        };
      });
    }
  }, [gameStatus, game]);

  const getElapsedTime = useCallback(() => {
    if (!startTime) return 0;
    const end = game?.endTime || Date.now();
    return Math.floor((end - startTime) / 1000);
  }, [startTime, game?.endTime]);

  return {
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
  };
}

