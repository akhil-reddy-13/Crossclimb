'use client';

import { useState } from 'react';
import { GameInfo } from '@/types/game';
import { generateWordLadderGame } from '@/utils/gameGenerator';
import GameEditor from './GameEditor';

interface AutoGenerateModeProps {
  onGameCreated: (gameInfo: GameInfo) => void;
  onBack: () => void;
}

export default function AutoGenerateMode({
  onGameCreated,
  onBack,
}: AutoGenerateModeProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [startWord, setStartWord] = useState('');
  const [endWord, setEndWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedGame, setGeneratedGame] = useState<GameInfo | null>(null);

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your puzzle');
      return;
    }

    if (!startWord || !endWord) {
      setError('Please enter both starting and ending words');
      return;
    }

    if (startWord.length !== endWord.length) {
      setError('Start and end words must have the same length');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const gameInfo = await generateWordLadderGame(
        startWord.toUpperCase(),
        endWord.toUpperCase()
      );

      if (!gameInfo) {
        setError(
          `Could not find a valid word ladder between "${startWord}" and "${endWord}". The words may not be connected, or one or both words may not be in the dictionary. Try different words!`
        );
        setLoading(false);
        return;
      }

      // Add title and author to game info
      const gameInfoWithMetadata = {
        ...gameInfo,
        title: title.trim(),
        author: author.trim() || undefined,
      };

      setLoading(false);
      setGeneratedGame(gameInfoWithMetadata);
    } catch (err) {
      setError('An error occurred while generating the puzzle. Please try again.');
      setLoading(false);
    }
  };

  const handlePublish = (gameInfo: GameInfo) => {
    onGameCreated(gameInfo);
  };

  if (generatedGame) {
    return (
      <GameEditor
        gameInfo={generatedGame}
        onPublish={handlePublish}
        onBack={() => setGeneratedGame(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={onBack}
          className="text-[#0077B5] hover:text-[#006399] mb-4 font-medium"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg p-6 space-y-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Auto-Generate Mode</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Title of your Crossclimb <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20"
                placeholder="e.g., My Awesome Puzzle"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Author (optional)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-3 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20"
                placeholder="Your name"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Starting Word</label>
              <input
                type="text"
                value={startWord}
                onChange={(e) => setStartWord(e.target.value.toUpperCase())}
                className="w-full p-3 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20 font-mono"
                placeholder="e.g., BARE"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Ending Word</label>
              <input
                type="text"
                value={endWord}
                onChange={(e) => setEndWord(e.target.value.toUpperCase())}
                className="w-full p-3 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20 font-mono"
                placeholder="e.g., FOOT"
                maxLength={10}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !startWord || !endWord}
              className="w-full p-3 bg-[#0077B5] hover:bg-[#006399] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded transition-colors shadow-md hover:shadow-lg"
            >
              {loading ? 'Generating...' : 'Generate Puzzle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

