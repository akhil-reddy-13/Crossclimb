'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameMode, GameInfo } from '@/types/game';
import ModeSelection from '@/components/ModeSelection';
import AutoGenerateMode from '@/components/AutoGenerateMode';
import ManualMode from '@/components/ManualMode';
import GameBoard from '@/components/GameBoard';
import { generatePuzzleId } from '@/utils/idGenerator';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<GameMode | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  const handleModeSelect = (selectedMode: 'auto' | 'manual') => {
    setMode(selectedMode);
  };

  const handleGameCreated = async (info: GameInfo) => {
    // Generate unique ID and save puzzle
    const puzzleId = generatePuzzleId();
    
    try {
      // Save to API
      await fetch('/api/puzzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: puzzleId, gameInfo: info }),
      });

      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(`puzzle-${puzzleId}`, JSON.stringify(info));
      }

      // Navigate to play page with the puzzle ID
      router.push(`/play/${puzzleId}`);
    } catch (error) {
      console.error('Error saving puzzle:', error);
      // If API fails, just use localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`puzzle-${puzzleId}`, JSON.stringify(info));
        router.push(`/play/${puzzleId}`);
      } else {
        // Fallback to direct play
        setGameInfo(info);
        setMode('playing');
      }
    }
  };

  const handleBackToMode = () => {
    setGameInfo(null);
    setMode(null);
  };

  const handleBackToSelection = () => {
    setMode(null);
  };

  if (mode === 'playing' && gameInfo) {
    return <GameBoard gameInfo={gameInfo} onBack={handleBackToMode} />;
  }

  if (mode === 'auto') {
    return <AutoGenerateMode onGameCreated={handleGameCreated} onBack={handleBackToSelection} />;
  }

  if (mode === 'manual') {
    return <ManualMode onGameCreated={handleGameCreated} onBack={handleBackToSelection} />;
  }

  return <ModeSelection onSelectMode={handleModeSelect} />;
}

