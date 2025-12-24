'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameInfo } from '@/types/game';
import GameBoard from '@/components/GameBoard';

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const id = params?.id as string;
        if (!id) {
          setError('Invalid puzzle ID');
          setLoading(false);
          return;
        }

        // Try to load from API
        const response = await fetch(`/api/puzzle?id=${id}`);
        
        if (!response.ok) {
          // Try localStorage as fallback
          const localPuzzle = localStorage.getItem(`puzzle-${id}`);
          if (localPuzzle) {
            setGameInfo(JSON.parse(localPuzzle));
            setLoading(false);
            return;
          }
          
          setError('Puzzle not found');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setGameInfo(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading puzzle:', err);
        setError('Failed to load puzzle');
        setLoading(false);
      }
    };

    loadPuzzle();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-800">Loading puzzle...</div>
      </div>
    );
  }

  if (error || !gameInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-4">
          <div className="text-red-600">{error || 'Puzzle not found'}</div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#0077B5] text-white rounded hover:bg-[#006399]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameBoard
      gameInfo={gameInfo}
      onBack={() => router.push('/')}
    />
  );
}

