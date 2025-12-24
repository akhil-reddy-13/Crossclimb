/**
 * Fetch all definitions for a word from dictionary API
 * https://api.dictionaryapi.dev/api/v2/entries/en/<word>
 */
export async function getWordDefinitionsList(word: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const definitions: string[] = [];
    
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      // Collect all definitions from all meanings
      if (entry.meanings && entry.meanings.length > 0) {
        for (const meaning of entry.meanings) {
          if (meaning.definitions && meaning.definitions.length > 0) {
            for (const def of meaning.definitions) {
              if (def.definition) {
                definitions.push(def.definition);
              }
            }
          }
        }
      }
    }

    return definitions;
  } catch (error) {
    console.error('Error fetching word definitions:', error);
    return [];
  }
}

/**
 * Fetch word definition from dictionary API (first definition only, for backward compatibility)
 * https://api.dictionaryapi.dev/api/v2/entries/en/<word>
 */
export async function getWordDefinition(word: string): Promise<string | null> {
  const definitions = await getWordDefinitionsList(word);
  return definitions.length > 0 ? definitions[0] : null;
}

/**
 * Generate a smart hint from definition - keeps it concise but complete
 */
export function generateHintFromDefinition(definition: string | null, word: string): string {
  if (!definition) {
    return `A ${word.length}-letter word`;
  }

  // Clean up the definition
  let hint = definition.trim();
  
  // Remove the word itself if it appears at the start
  const wordLower = word.toLowerCase();
  if (hint.toLowerCase().startsWith(wordLower + ' ')) {
    hint = hint.substring(word.length).trim();
  }
  
  // Remove leading articles
  hint = hint.replace(/^(a|an|the)\s+/i, '').trim();
  
  // Capitalize first letter
  if (hint.length > 0) {
    hint = hint.charAt(0).toUpperCase() + hint.slice(1);
  }

  // Handle semicolon-separated lists (like "Going; journey; travel; voyage; course; passage.")
  // Take only the first item (or first 2 if first is a single word)
  if (hint.includes(';')) {
    const parts = hint.split(';').map(p => p.trim());
    if (parts.length > 1) {
      const firstPart = parts[0];
      const firstWords = firstPart.split(/\s+/);
      
      // If first part is a single word, take first two items for context
      // Otherwise, just use the first part
      if (firstWords.length === 1) {
        hint = parts.slice(0, 2).join('; ');
      } else {
        hint = firstPart;
      }
      // Remove trailing punctuation
      hint = hint.replace(/[,;:.]$/, '');
      return hint || `A ${word.length}-letter word`;
    }
  }

  // Smart truncation: try to keep complete thoughts
  const words = hint.split(/\s+/);
  
  // If it's already short (4 words or less), keep it all
  if (words.length <= 4) {
    hint = hint.replace(/[,;:]$/, '');
    return hint || `A ${word.length}-letter word`;
  }

  // For 5-8 words, check if we can stop at a good point
  if (words.length <= 8) {
    // Look for natural break points
    const periodIndex = hint.indexOf('.');
    const semicolonIndex = hint.indexOf(';');
    const commaIndex = hint.indexOf(',');
    
    // Prefer stopping at 4 words if it ends on a noun-like word (simple heuristic)
    const firstFour = words.slice(0, 4).join(' ');
    const fourthWord = words[3]?.toLowerCase() || '';
    // Common noun endings or patterns
    const nounEndings = ['ing', 'tion', 'sion', 'ment', 'ness', 'ity', 'er', 'or', 'ist'];
    const endsOnNoun = nounEndings.some(ending => fourthWord.endsWith(ending)) || 
                       !fourthWord.match(/^(the|a|an|and|or|but|to|of|in|on|at|for|with|from)$/i);
    
    if (endsOnNoun && periodIndex === -1 && semicolonIndex === -1) {
      hint = firstFour;
      hint = hint.replace(/[,;:]$/, '');
      return hint || `A ${word.length}-letter word`;
    }
    
    // Otherwise, look for punctuation breaks
    if (periodIndex > 0 && periodIndex < 50) {
      hint = hint.substring(0, periodIndex);
    } else if (semicolonIndex > 0 && semicolonIndex < 50) {
      hint = hint.substring(0, semicolonIndex);
    } else if (commaIndex > 0 && commaIndex < 50) {
      // Only use comma if it's followed by a conjunction or ends a clause
      const afterComma = hint.substring(commaIndex + 1).trim();
      if (afterComma.match(/^(and|or|but|so|yet|nor)\s+/i)) {
        hint = hint.substring(0, commaIndex);
      }
    }
    
    hint = hint.replace(/[,;:]$/, '');
    return hint || `A ${word.length}-letter word`;
  }

  // For longer definitions (9+ words), try to find a good stopping point
  const periodIndex = hint.indexOf('.');
  const semicolonIndex = hint.indexOf(';');
  const commaAndIndex = hint.search(/,\s+(and|or|but)\s+/i);
  
  let cutIndex = -1;
  if (periodIndex > 0 && periodIndex < 60) {
    cutIndex = periodIndex;
  } else if (semicolonIndex > 0 && semicolonIndex < 60) {
    cutIndex = semicolonIndex;
  } else if (commaAndIndex > 0 && commaAndIndex < 60) {
    cutIndex = commaAndIndex;
  }
  
  if (cutIndex > 0) {
    hint = hint.substring(0, cutIndex);
  } else {
    // No good break point found, take first 6 words max (reduced from 10)
    hint = words.slice(0, 6).join(' ');
    hint = hint.replace(/[,;:]$/, '');
  }

  return hint || `A ${word.length}-letter word`;
}

/**
 * Fetch definition for multiple words in parallel
 */
export async function getWordDefinitions(words: string[]): Promise<Record<string, string>> {
  const promises = words.map(async (word) => {
    const definition = await getWordDefinition(word);
    return { word, definition };
  });

  const results = await Promise.all(promises);
  
  const definitions: Record<string, string> = {};
  for (const { word, definition } of results) {
    definitions[word.toUpperCase()] = generateHintFromDefinition(definition, word);
  }

  return definitions;
}

