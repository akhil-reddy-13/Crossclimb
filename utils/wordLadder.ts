/**
 * Check if two words differ by exactly one letter
 */
export function differByOne(str1: string, str2: string): boolean {
  if (str1.length !== str2.length) return false;

  let diffCount = 0;

  for (let i = 0; i < str1.length; i++) {
    if (str1[i].toUpperCase() !== str2[i].toUpperCase()) {
      diffCount++;
      if (diffCount > 1) return false;
    }
  }

  return diffCount === 1;
}

/**
 * Generate a word ladder between two words using BFS
 * This is a simplified version - in production, you'd want to use a word dictionary
 */
export function generateWordLadder(
  startWord: string,
  endWord: string,
  maxSteps: number = 10
): string[] | null {
  if (startWord.length !== endWord.length) return null;

  const visited = new Set<string>();
  const queue: { word: string; path: string[] }[] = [{ word: startWord, path: [startWord] }];
  visited.add(startWord.toUpperCase());

  while (queue.length > 0) {
    const { word, path } = queue.shift()!;

    if (word.toUpperCase() === endWord.toUpperCase()) {
      return path;
    }

    if (path.length >= maxSteps) continue;

    // Generate neighbors (words that differ by one letter)
    const neighbors = generateNeighbors(word);

    for (const neighbor of neighbors) {
      const neighborUpper = neighbor.toUpperCase();
      if (!visited.has(neighborUpper) && differByOne(word, neighbor)) {
        visited.add(neighborUpper);
        queue.push({ word: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return null;
}

/**
 * Generate potential neighbor words by changing one letter at a time
 * This is a heuristic approach - a real implementation would use a dictionary
 */
function generateNeighbors(word: string): string[] {
  const neighbors: string[] = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  for (let i = 0; i < word.length; i++) {
    for (const letter of letters) {
      const neighbor = word.slice(0, i) + letter + word.slice(i + 1);
      if (neighbor.toUpperCase() !== word.toUpperCase()) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
}

/**
 * Find shortest path between two words (simplified)
 * For a real implementation, you'd integrate with a word dictionary API or local dictionary
 */
export function findWordLadderPath(
  startWord: string,
  endWord: string,
  dictionary: Set<string>
): string[] | null {
  if (startWord.length !== endWord.length) return null;

  const startUpper = startWord.toUpperCase();
  const endUpper = endWord.toUpperCase();

  // Filter dictionary to words of same length
  const sameLengthWords = Array.from(dictionary).filter(
    w => w.length === startWord.length
  );

  const visited = new Set<string>();
  const queue: { word: string; path: string[] }[] = [{ word: startUpper, path: [startUpper] }];
  visited.add(startUpper);

  while (queue.length > 0) {
    const { word, path } = queue.shift()!;

    if (word === endUpper) {
      return path;
    }

    // Find neighbors in dictionary
    for (const dictWord of sameLengthWords) {
      const dictUpper = dictWord.toUpperCase();
      if (!visited.has(dictUpper) && differByOne(word, dictUpper)) {
        visited.add(dictUpper);
        queue.push({ word: dictUpper, path: [...path, dictUpper] });
      }
    }
  }

  return null;
}

