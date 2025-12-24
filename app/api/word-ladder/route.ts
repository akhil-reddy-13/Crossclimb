import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface DictionaryData {
  words: string[];
  graph: Record<string, string[]>; // word -> array of neighbor words
  groups: Record<number, string[]>; // groupId -> array of words in that group
}

// Cache loaded dictionaries in memory
const dictionaryCache: Map<number, DictionaryData> = new Map();

/**
 * Load dictionary for a specific word length
 */
function loadDictionary(wordLength: number): DictionaryData | null {
  // Check cache first
  if (dictionaryCache.has(wordLength)) {
    return dictionaryCache.get(wordLength)!;
  }

  try {
    const filePath = path.join(process.cwd(), 'data', `words-${wordLength}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: DictionaryData = JSON.parse(fileContent);
    
    // Cache it
    dictionaryCache.set(wordLength, data);
    
    return data;
  } catch (error) {
    console.error(`Error loading dictionary for length ${wordLength}:`, error);
    return null;
  }
}

/**
 * Find shortest path using BFS
 */
function findShortestPath(
  startWord: string,
  endWord: string,
  graph: Record<string, string[]>
): string[] | null {
  const start = startWord.toUpperCase();
  const end = endWord.toUpperCase();

  if (!graph[start] || !graph[end]) {
    return null; // Words not in dictionary
  }

  if (start === end) {
    return [start];
  }

  // BFS to find shortest path
  const visited = new Set<string>();
  const queue: { word: string; path: string[] }[] = [{ word: start, path: [start] }];
  visited.add(start);

  while (queue.length > 0) {
    const { word, path } = queue.shift()!;

    if (word === end) {
      return path;
    }

    // Check all neighbors
    const neighbors = graph[word] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ word: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return null; // No path found
}

/**
 * Check if two words are in the same connectivity group
 */
function areInSameGroup(
  word1: string,
  word2: string,
  groups: Record<number, string[]>
): boolean {
  const w1 = word1.toUpperCase();
  const w2 = word2.toUpperCase();

  for (const group of Object.values(groups)) {
    const groupSet = new Set(group);
    if (groupSet.has(w1) && groupSet.has(w2)) {
      return true;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startWord, endWord } = body;

    if (!startWord || !endWord) {
      return NextResponse.json(
        { error: 'Missing startWord or endWord' },
        { status: 400 }
      );
    }

    const start = startWord.toUpperCase().trim();
    const end = endWord.toUpperCase().trim();

    if (start.length !== end.length) {
      return NextResponse.json(
        { error: 'Start and end words must have the same length' },
        { status: 400 }
      );
    }

    if (start.length < 2 || start.length > 15) {
      return NextResponse.json(
        { error: 'Word length must be between 2 and 15 letters' },
        { status: 400 }
      );
    }

    // Load dictionary for this word length
    const dictionary = loadDictionary(start.length);

    if (!dictionary) {
      return NextResponse.json(
        { error: `Dictionary for ${start.length}-letter words not found. Please run preprocessing first.` },
        { status: 404 }
      );
    }

    // Check if words exist in dictionary
    if (!dictionary.graph[start] || !dictionary.graph[end]) {
      return NextResponse.json(
        { error: 'One or both words not found in dictionary' },
        { status: 400 }
      );
    }

    // Check if words are in the same connectivity group (quick check before BFS)
    // This is an optimization: if words aren't in the same group, they can't be connected
    if (!areInSameGroup(start, end, dictionary.groups)) {
      return NextResponse.json(
        { error: 'Words are not connected. These words cannot be transformed into each other through valid word ladder steps.' },
        { status: 400 }
      );
    }

    // Find shortest path
    const path = findShortestPath(start, end, dictionary.graph);

    if (!path || path.length < 2) {
      return NextResponse.json(
        { error: 'No valid word ladder path found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      path,
      length: path.length,
    });
  } catch (error) {
    console.error('Error in word-ladder API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

