'use client';

import { useState } from 'react';
import { GameInfo } from '@/types/game';
import { getWordDefinitionsList, getWordDefinition, generateHintFromDefinition } from '@/utils/dictionaryApi';

interface GameEditorProps {
  gameInfo: GameInfo;
  onPublish: (gameInfo: GameInfo) => void;
  onBack: () => void;
}

export default function GameEditor({ gameInfo, onPublish, onBack }: GameEditorProps) {
  const [editedGame, setEditedGame] = useState<GameInfo>(gameInfo);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  // Track current definition index for each word
  const [definitionIndices, setDefinitionIndices] = useState<Record<string, number>>({});
  // Track whether we're showing compound or individual definitions for edge words
  const [edgeHintMode, setEdgeHintMode] = useState<'compound' | 'individual'>('compound');

  const updateWordHint = (index: number, hint: string) => {
    setEditedGame((prev) => ({
      ...prev,
      words: prev.words.map((w, i) => (i === index ? { ...w, hint } : w)),
    }));
  };

  const updateEdgeHint = (hint: string) => {
    setEditedGame((prev) => ({
      ...prev,
      edgeHint: hint,
    }));
  };

  const regenerateEdgeHint = async () => {
    setLoadingWord('edge');
    try {
      // Edge words: check compound first, then individual
      const [word1, word2] = editedGame.edgeWords;
      const compound1 = word1 + word2;
      const compound2 = word2 + word1;
      
      // Try compound words first
      if (edgeHintMode === 'compound') {
        const compound1Defs = await getWordDefinitionsList(compound1);
        const compound2Defs = await getWordDefinitionsList(compound2);
        
        const compoundDefs = compound1Defs.length > 0 ? compound1Defs : compound2Defs;
        const compoundWord = compound1Defs.length > 0 ? compound1 : compound2;
        
        if (compoundDefs.length > 0) {
          const currentIndex = definitionIndices[`edge-${compoundWord}`] || 0;
          
          // If multiple definitions, cycle through them
          if (compoundDefs.length > 1) {
            const nextIndex = (currentIndex + 1) % compoundDefs.length;
            setDefinitionIndices({ ...definitionIndices, [`edge-${compoundWord}`]: nextIndex });
            const definition = compoundDefs[nextIndex];
            const hint = generateHintFromDefinition(definition, compoundWord);
            updateEdgeHint(`The top + bottom rows = ${hint}`);
            return;
          } else {
            // Only one definition, switch to individual mode
            setEdgeHintMode('individual');
          }
        } else {
          // No compound word, switch to individual mode
          setEdgeHintMode('individual');
        }
      }
      
      // Individual mode: combine the two word definitions
      if (edgeHintMode === 'individual') {
        const def1 = await getWordDefinition(word1);
        const def2 = await getWordDefinition(word2);
        
        if (def1 && def2) {
          const hint1 = generateHintFromDefinition(def1, word1);
          const hint2 = generateHintFromDefinition(def2, word2);
          updateEdgeHint(`The top + bottom rows = A compound word or phrase combining ${hint1.toLowerCase()} and ${hint2.toLowerCase()}`);
        } else {
          updateEdgeHint(`The top + bottom rows = A compound word or phrase connecting "${word1}" and "${word2}"`);
        }
        // Switch back to compound mode for next cycle
        setEdgeHintMode('compound');
      }
    } catch (error) {
      console.error('Error regenerating edge hint:', error);
    } finally {
      setLoadingWord(null);
    }
  };

  const regenerateHint = async (word: string, index: number) => {
    setLoadingWord(word);
    try {
      // Middle word: cycle through definitions
      const definitions = await getWordDefinitionsList(word);
      if (definitions.length === 0) {
        updateWordHint(index, `A ${word.length}-letter word`);
        return;
      }
      
      const currentIndex = definitionIndices[word] || 0;
      const nextIndex = (currentIndex + 1) % definitions.length;
      setDefinitionIndices({ ...definitionIndices, [word]: nextIndex });
      
      const definition = definitions[nextIndex];
      const hint = generateHintFromDefinition(definition, word);
      updateWordHint(index, hint);
    } catch (error) {
      console.error('Error regenerating hint:', error);
    } finally {
      setLoadingWord(null);
    }
  };

  const handlePublish = () => {
    onPublish(editedGame);
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
          <h2 className="text-2xl font-bold text-gray-800">Edit Your Puzzle</h2>
          <p className="text-gray-600">Review and edit the clues before publishing. You can regenerate hints or write your own.</p>

          <div className="space-y-6">
            {/* Edge Words */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Edge Words</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-800 font-mono text-xl mb-2 font-bold">{editedGame.edgeWords[0]}</div>
                </div>
                <div>
                  <div className="text-gray-800 font-mono text-xl mb-2 font-bold">{editedGame.edgeWords[1]}</div>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={regenerateEdgeHint}
                  disabled={loadingWord === 'edge'}
                  className="text-xs text-[#0077B5] hover:text-[#006399] disabled:opacity-50 font-medium"
                >
                  {loadingWord === 'edge' ? 'Loading...' : 'Regenerate hint'}
                </button>
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-2 font-medium">Edge Hint (shared by both words)</label>
                <input
                  type="text"
                  value={editedGame.edgeHint}
                  onChange={(e) => updateEdgeHint(e.target.value)}
                  className="w-full p-2 rounded bg-white text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20"
                  placeholder="e.g., Compound word for 'having no shoes or socks on'"
                />
              </div>
            </div>

            {/* Middle Words */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Middle Words</h3>
              {editedGame.words.map((word, index) => (
                <div key={index} className="bg-white rounded-lg p-3 space-y-2 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-800 font-mono text-lg font-bold">{word.correct}</div>
                    <button
                      onClick={() => regenerateHint(word.correct, index)}
                      disabled={loadingWord === word.correct}
                      className="text-xs px-2 py-1 bg-[#0077B5] hover:bg-[#006399] text-white rounded disabled:opacity-50 font-medium"
                    >
                      {loadingWord === word.correct ? 'Loading...' : 'Regenerate'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={word.hint}
                    onChange={(e) => updateWordHint(index, e.target.value)}
                    className="w-full p-2 rounded bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-[#0077B5] focus:ring-2 focus:ring-[#0077B5]/20 text-sm"
                    placeholder="Enter hint for this word"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded transition-colors shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 px-4 py-3 bg-[#0077B5] hover:bg-[#006399] text-white font-bold rounded transition-colors shadow-md hover:shadow-lg"
              >
                Publish Puzzle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

