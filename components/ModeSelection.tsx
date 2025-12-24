'use client';

import { useState } from 'react';
import { GameMode } from '@/types/game';

interface ModeSelectionProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0077B5] via-[#005885] to-[#003d55] p-4">
      <div className="max-w-3xl w-full space-y-8 relative">
        {/* About button */}
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="absolute top-0 right-0 text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          About
        </button>

        {/* About modal */}
        {showAbout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAbout(false)}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 max-w-2xl w-full border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-white">About Custom Crossclimb</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
             <div className="space-y-4 text-gray-200 leading-relaxed">
                <p>
                  <strong className="text-white">My Motivation:</strong> I created Custom Crossclimb because I love word puzzles and wanted to make it easy for anyone to create and share their own word ladder puzzles. This is my take on the classic Crossclimb game, with full control over puzzle creation.
                </p>
                <p>
                  <strong className="text-white">How It Works:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Word Ladder Algorithm:</strong> I built a word ladder function that finds the shortest possible path between two words. It uses the Collins Scrabble Words 2019 dictionary and a breadth-first search (BFS) algorithm to efficiently find the minimum number of steps needed to transform one word into another, where each step changes exactly one letter.</li>
                  <li><strong className="text-white">Clue Generation:</strong> Once the word ladder path is found, the app uses a free dictionary API to fetch definitions for each word. The definitions are intelligently trimmed to keep clues concise while preserving important information - we look for natural break points like periods or commas before conjunctions, rather than just cutting off at a fixed word count.</li>
                  <li><strong className="text-white">Compound Words:</strong> For the final two words (top and bottom rows), the app checks if they form a compound word in either order. If found, it uses that compound word&apos;s definition. Otherwise, it combines the individual word definitions to create a helpful hint.</li>
                </ul>
                <p className="text-sm text-gray-400 italic pt-4">
                  Not affiliated with LinkedIn. Made by Akhil Reddy!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Custom Crossclimb</h1>
          <p className="text-blue-100 text-lg">Create your own version of LinkedIn Crossclimb!</p>
          <p className="text-blue-200 text-sm italic">Not affiliated with LinkedIn. Made by Akhil Reddy!</p>
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg backdrop-blur-sm">
            <p className="text-yellow-100 text-sm">
              🧪 <strong>Beta Mode:</strong> Enhanced AI-generated clues are being worked on! Currently using dictionary definitions.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectMode('auto')}
            className="p-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl border-2 border-white/30 transition-all text-left shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Auto-Generate</h2>
            <p className="text-blue-100">
              Choose your starting and ending words, and we&apos;ll automatically generate
              the middle words and clues for you!
            </p>
          </button>

          <button
            onClick={() => onSelectMode('manual')}
            className="p-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl border-2 border-white/30 transition-all text-left shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Manual Creation</h2>
            <p className="text-blue-100">
              Design your own puzzle by creating all the words and clues yourself.
              Make sure each word differs by exactly one letter!
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

