import * as fs from 'fs';
import * as path from 'path';
import { differByOne } from '../utils/wordLadder';

interface WordNode {
  word: string;
  neighbors: string[];
}

interface DictionaryData {
  words: string[];
  graph: Record<string, string[]>; // word -> array of neighbor words
  groups: Record<number, string[]>; // groupId -> array of words in that group
}

/**
 * Preprocess the dictionary file into optimized JSON files by word length
 */
async function preprocessDictionary() {
  const dictionaryPath = path.join(__dirname, '../dictionary.txt');
  const outputDir = path.join(__dirname, '../data');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Reading dictionary file...');
  const fileContent = fs.readFileSync(dictionaryPath, 'utf-8');
  const lines = fileContent.split('\n');
  
  // Skip header line and filter out empty lines
  const words = lines
    .slice(1) // Skip "Collins Scrabble Words (2019). 279,496 words. Words only."
    .map(line => line.trim().toUpperCase())
    .filter(word => word.length > 0 && /^[A-Z]+$/.test(word));

  console.log(`Found ${words.length} words`);

  // Group words by length
  const wordsByLength: Record<number, string[]> = {};
  for (const word of words) {
    const len = word.length;
    if (!wordsByLength[len]) {
      wordsByLength[len] = [];
    }
    wordsByLength[len].push(word);
  }

  console.log(`Grouped into ${Object.keys(wordsByLength).length} word lengths`);

  // Process each word length (2-10 are most common for word ladders)
  const lengthsToProcess = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (const length of lengthsToProcess) {
    const wordList = wordsByLength[length];
    if (!wordList || wordList.length === 0) continue;

    console.log(`\nProcessing ${length}-letter words (${wordList.length} words)...`);
    
    const graph: Record<string, string[]> = {};
    
    // Build graph using wildcard pattern matching (much faster!)
    console.log(`  Building word graph using pattern matching...`);
    
    // Step 1: Create pattern groups (e.g., "_AT" -> [CAT, BAT, RAT, ...])
    const patternMap: Record<string, string[]> = {};
    
    for (const word of wordList) {
      for (let i = 0; i < word.length; i++) {
        const pattern = word.slice(0, i) + '_' + word.slice(i + 1);
        if (!patternMap[pattern]) {
          patternMap[pattern] = [];
        }
        patternMap[pattern].push(word);
      }
    }
    
    console.log(`  Created ${Object.keys(patternMap).length} patterns`);
    
    // Step 2: Build graph from pattern groups
    let graphProgress = 0;
    for (const word of wordList) {
      if (graphProgress % 1000 === 0 && graphProgress > 0) {
        process.stdout.write(`\r  Building graph: ${graphProgress}/${wordList.length}`);
      }
      graphProgress++;
      
      const neighborSet = new Set<string>();
      
      // For each position, get all words with the same pattern
      for (let i = 0; i < word.length; i++) {
        const pattern = word.slice(0, i) + '_' + word.slice(i + 1);
        const wordsInPattern = patternMap[pattern] || [];
        
        for (const neighbor of wordsInPattern) {
          if (neighbor !== word) {
            neighborSet.add(neighbor);
          }
        }
      }
      
      graph[word] = Array.from(neighborSet);
    }
    process.stdout.write(`\r  Building graph: ${wordList.length}/${wordList.length} - Done!\n`);
    
    console.log(`  Graph built with ${Object.keys(graph).length} nodes`);

    // Find connectivity groups using BFS
    console.log(`  Finding connectivity groups...`);
    const groups: Record<number, string[]> = {};
    const visited = new Set<string>();
    let groupId = 0;

    for (const word of wordList) {
      if (visited.has(word)) continue;

      // BFS to find all connected words
      const group: string[] = [];
      const queue = [word];
      visited.add(word);

      while (queue.length > 0) {
        const current = queue.shift()!;
        group.push(current);

        for (const neighbor of graph[current] || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      if (group.length > 0) {
        groups[groupId] = group;
        groupId++;
      }
    }

    console.log(`  Found ${groupId} connectivity groups`);

    // Create optimized data structure
    const data: DictionaryData = {
      words: wordList,
      graph,
      groups,
    };

    // Save to JSON file
    const outputPath = path.join(outputDir, `words-${length}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data), 'utf-8');
    
    const fileSize = fs.statSync(outputPath).size;
    console.log(`  Saved to ${outputPath} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log('\n✅ Dictionary preprocessing complete!');
}

// Run if executed directly
if (require.main === module) {
  preprocessDictionary().catch(console.error);
}

export { preprocessDictionary };

