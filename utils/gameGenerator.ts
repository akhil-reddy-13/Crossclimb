import { GameInfo } from '@/types/game';
import { differByOne } from './wordLadder';
import { getWordDefinitions, getWordDefinition, generateHintFromDefinition } from './dictionaryApi';

// Simple word dictionary - in production, use a comprehensive dictionary API
const COMMON_WORDS: Record<number, string[]> = {
  4: [
    'BARE', 'CARE', 'CORE', 'CORK', 'FORK', 'FORT', 'FOOT',
    'POST', 'COST', 'COLT', 'BOLT', 'BOAT', 'GOAT', 'GOAL',
    'PACK', 'PACE', 'PALE', 'SALE', 'SALT',
    'HEAD', 'HEAL', 'TEAL', 'TELL', 'TALL',
    'LIVE', 'LIFE', 'LIKE', 'BIKE', 'BAKE',
    'WORD', 'WORK', 'FORK', 'FORT', 'PORT',
    'COLD', 'COLT', 'CULT', 'CULT',
    'WARM', 'WORM', 'FORM', 'FORK',
  ],
  5: [
    'APPLE', 'AMPLE', 'AMPLE',
    'BRAIN', 'BRAWN', 'DRAWN',
    'CHAIR', 'CHOIR', 'CHORD',
    'EARTH', 'HEART', 'HEARD',
  ],
};

/**
 * Generate hints for words - simplified version
 * In production, you'd use an API like WordsAPI or similar
 */
function generateHint(word: string): string {
  // Simple hint generator - in production, use a dictionary/thesaurus API
  const hints: Record<string, string> = {
    'BARE': 'Uncovered or naked',
    'CARE': 'Compassionate attention given to someone',
    'CORE': 'Discarded part of an apple',
    'CORK': 'Stopper in a champagne bottle',
    'FORK': 'Eating utensil with tines',
    'FORT': '____nite (popular online game)',
    'FOOT': 'Part of the leg',
    'POST': 'Mail delivery item',
    'COST': 'Price or expense',
    'COLT': 'Young horse',
    'BOLT': 'Fastener or run quickly',
    'BOAT': 'Water vessel',
    'GOAT': 'Animal known for climbing',
    'GOAL': 'Objective or target',
    'PACK': 'Group of wolves',
    'PACE': 'Walking speed',
  };

  return hints[word.toUpperCase()] || `A ${word.length}-letter word`;
}

/**
 * Find a word ladder path between two words using the API
 * Returns the minimum path found
 */
export async function generateWordLadderGame(
  startWord: string,
  endWord: string
): Promise<GameInfo | null> {
  if (startWord.length !== endWord.length) return null;

  const start = startWord.toUpperCase().trim();
  const end = endWord.toUpperCase().trim();

  try {
    // Call the word ladder API to find the shortest path
    const response = await fetch('/api/word-ladder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startWord: start, endWord: end }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Word ladder API error:', error);
      // Return null to trigger error message in UI
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.path || data.path.length < 2) {
      return null;
    }

    const path = data.path;

    // Need at least 3 words (start, middle, end)
    if (path.length < 3) {
      return null;
    }

    const middleWords = path.slice(1, -1);
    const edgeWords = [path[0], path[path.length - 1]] as [string, string];

    // Get dictionary definitions first (free, unlimited) - this is the default
    const allWords = [...path];
    const definitions = await getWordDefinitions(allWords);

    // Optionally enhance with Gemini if enabled (for testing/beta)
    const useGemini = process.env.USE_GEMINI_CLUES === 'true';
    let aiClues = { middleClues: {} as Record<string, string>, edgeHint: null as string | null };
    if (useGemini) {
      aiClues = await generateAiClues(middleWords, edgeWords);
    }

    const middleWordsWithHints = middleWords.map((word) => ({
      correct: word,
      // Use dictionary as primary, Gemini as optional enhancement
      hint: definitions[word] || aiClues.middleClues[word] || generateHint(word),
    }));

    // Generate edge hint (check for compound word first, then Gemini, then dictionary, then fallback)
    let edgeHint: string;
    
    // Try Gemini first if enabled
    if (aiClues.edgeHint) {
      edgeHint = aiClues.edgeHint;
    } else {
      // Check if the two words form a compound word (in either order)
      const compound1 = edgeWords[0] + edgeWords[1];
      const compound2 = edgeWords[1] + edgeWords[0];
      
      const compoundDef1 = await getWordDefinition(compound1);
      const compoundDef2 = await getWordDefinition(compound2);
      
      if (compoundDef1) {
        // Found compound word: word1 + word2
        const compoundHint = generateHintFromDefinition(compoundDef1, compound1);
        edgeHint = `The top + bottom rows = ${compoundHint}`;
      } else if (compoundDef2) {
        // Found compound word: word2 + word1
        const compoundHint = generateHintFromDefinition(compoundDef2, compound2);
        edgeHint = `The top + bottom rows = ${compoundHint}`;
      } else {
        // No compound word found, use individual definitions
        const edgeDef1 = await getWordDefinition(edgeWords[0]);
        const edgeDef2 = await getWordDefinition(edgeWords[1]);
        
        if (edgeDef1 && edgeDef2) {
          // Try to create a more natural compound hint
          const hint1 = generateHintFromDefinition(edgeDef1, edgeWords[0]);
          const hint2 = generateHintFromDefinition(edgeDef2, edgeWords[1]);
          edgeHint = `The top + bottom rows = A compound word or phrase combining ${hint1.toLowerCase()} and ${hint2.toLowerCase()}`;
        } else {
          edgeHint = generateCompoundHint(edgeWords[0], edgeWords[1]);
        }
      }
    }

    return {
      words: middleWordsWithHints,
      edgeWords,
      edgeHint,
    };
  } catch (error) {
    console.error('Error generating word ladder:', error);
    return null;
  }
}

/**
 * Generate a compound hint for two words
 */
function generateCompoundHint(word1: string, word2: string): string {
  // Simple compound hint generator
  const compounds: Record<string, string> = {
    'BARE FOOT': 'Compound word for "having no shoes or socks on"',
    'HEAD HEART': 'Compound word referring to emotions',
  };

  const key = `${word1} ${word2}`;
  return compounds[key] || `Compound word or phrase connecting "${word1}" and "${word2}"`;
}

async function generateAiClues(
  middleWords: string[],
  edgeWords: [string, string]
): Promise<{ middleClues: Record<string, string>; edgeHint: string | null }> {
  try {
    const response = await fetch('/api/clues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ middleWords, edgeWords }),
    });

    if (!response.ok) {
      return { middleClues: {}, edgeHint: null };
    }

    const data = await response.json();
    return {
      middleClues: data?.clues?.middleClues || {},
      edgeHint: data?.clues?.edgeHint || null,
    };
  } catch (error) {
    console.error('AI clue generation failed, using fallback hints:', error);
    return { middleClues: {}, edgeHint: null };
  }
}

/**
 * Validate that a word ladder is valid (each word differs by one letter)
 */
export function validateWordLadder(words: string[]): boolean {
  if (words.length < 2) return false;

  for (let i = 0; i < words.length - 1; i++) {
    if (!differByOne(words[i], words[i + 1])) {
      return false;
    }
  }

  return true;
}

