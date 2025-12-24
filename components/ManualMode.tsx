'use client';

import { useState } from 'react';
import { GameInfo } from '@/types/game';
import { validateWordLadder } from '@/utils/gameGenerator';
import { differByOne } from '@/utils/wordLadder';

interface ManualModeProps {
  onGameCreated: (gameInfo: GameInfo) => void;
  onBack: () => void;
}

export default function ManualMode({ onGameCreated, onBack }: ManualModeProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [edgeWords, setEdgeWords] = useState<[string, string]>(['', '']);
  const [edgeHint, setEdgeHint] = useState('');
  const [middleWords, setMiddleWords] = useState<
    Array<{ word: string; hint: string }>
  >([{ word: '', hint: '' }]);
  const [error, setError] = useState<string | null>(null);

  const addMiddleWord = () => {
    setMiddleWords([...middleWords, { word: '', hint: '' }]);
  };

  const removeMiddleWord = (index: number) => {
    if (middleWords.length > 1) {
      setMiddleWords(middleWords.filter((_, i) => i !== index));
    }
  };

  const updateMiddleWord = (index: number, field: 'word' | 'hint', value: string) => {
    const updated = [...middleWords];
    updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    setMiddleWords(updated);
  };

  const handleCreate = () => {
    setError(null);

    // Validate title
    if (!title.trim()) {
      setError('Please enter a title for your puzzle');
      return;
    }

    // Validate edge words
    if (!edgeWords[0] || !edgeWords[1]) {
      setError('Please enter both starting and ending words');
      return;
    }

    if (edgeWords[0].length !== edgeWords[1].length) {
      setError('Starting and ending words must have the same length');
      return;
    }

    // Validate middle words
    const allMiddleWords = middleWords.map((m) => m.word.toUpperCase()).filter((w) => w);
    if (allMiddleWords.length === 0) {
      setError('Please add at least one middle word');
      return;
    }

    // Check all words have same length
    const wordLength = edgeWords[0].length;
    if (
      !allMiddleWords.every((w) => w.length === wordLength) ||
      edgeWords[1].length !== wordLength
    ) {
      setError('All words must have the same length');
      return;
    }

    // Check all words have hints
    if (!allMiddleWords.every((w, i) => middleWords[i].hint.trim())) {
      setError('Please provide hints for all middle words');
      return;
    }

    if (!edgeHint.trim()) {
      setError('Please provide a hint for the edge words');
      return;
    }

    // Validate word ladder
    const allWords = [edgeWords[0].toUpperCase(), ...allMiddleWords, edgeWords[1].toUpperCase()];
    if (!validateWordLadder(allWords)) {
      setError(
        'Invalid word ladder! Each word must differ by exactly one letter from the next word.'
      );
      return;
    }

    // Create game info
    const gameInfo: GameInfo = {
      title: title.trim(),
      author: author.trim() || undefined,
      words: allMiddleWords.map((word, i) => ({
        correct: word,
        hint: middleWords[i].hint,
      })),
      edgeWords: [edgeWords[0].toUpperCase(), edgeWords[1].toUpperCase()],
      edgeHint,
    };

    onGameCreated(gameInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={onBack}
          className="text-[#0077B5] hover:text-[#006399] mb-4 font-medium"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg p-6 space-y-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Manual Creation Mode</h2>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Starting Word</label>
                <input
                  type="text"
                  value={edgeWords[0]}
                  onChange={(e) =>
                    setEdgeWords([e.target.value.toUpperCase(), edgeWords[1]])
                  }
                  className="w-full p-3 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20 font-mono"
                  placeholder="e.g., BARE"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Ending Word</label>
                <input
                  type="text"
                  value={edgeWords[1]}
                  onChange={(e) =>
                    setEdgeWords([edgeWords[0], e.target.value.toUpperCase()])
                  }
                  className="w-full p-3 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20 font-mono"
                  placeholder="e.g., FOOT"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Hint for Edge Words</label>
              <input
                type="text"
                value={edgeHint}
                onChange={(e) => setEdgeHint(e.target.value)}
                className="w-full p-3 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20"
                placeholder="e.g., Compound word for 'having no shoes or socks on'"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-medium">Middle Words</label>
                <button
                  onClick={addMiddleWord}
                  className="px-3 py-1 bg-[#0077B5] hover:bg-[#006399] text-white rounded text-sm font-medium shadow-sm"
                >
                  + Add Word
                </button>
              </div>

              <div className="space-y-3">
                {middleWords.map((mw, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={mw.word}
                        onChange={(e) =>
                          updateMiddleWord(index, 'word', e.target.value)
                        }
                        className="p-2 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20 font-mono"
                        placeholder="Word"
                      />
                      <input
                        type="text"
                        value={mw.hint}
                        onChange={(e) =>
                          updateMiddleWord(index, 'hint', e.target.value)
                        }
                        className="p-2 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20"
                        placeholder="Hint"
                      />
                    </div>
                    {middleWords.length > 1 && (
                      <button
                        onClick={() => removeMiddleWord(index)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
            )}

            <button
              onClick={handleCreate}
              className="w-full p-3 bg-[#0077B5] hover:bg-[#006399] text-white font-bold rounded transition-colors shadow-md hover:shadow-lg"
            >
              Create Puzzle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

