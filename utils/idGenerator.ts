/**
 * Generate a unique ID for puzzle sharing
 */
export function generatePuzzleId(): string {
  // Generate a random 8-character alphanumeric ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Save puzzle to localStorage (for now - in production, use a database)
 */
export function savePuzzleLocally(id: string, gameInfo: any): void {
  if (typeof window !== 'undefined') {
    const puzzles = JSON.parse(localStorage.getItem('crossclimb-puzzles') || '{}');
    puzzles[id] = {
      ...gameInfo,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('crossclimb-puzzles', JSON.stringify(puzzles));
  }
}

/**
 * Load puzzle from localStorage
 */
export function loadPuzzleLocally(id: string): any | null {
  if (typeof window !== 'undefined') {
    const puzzles = JSON.parse(localStorage.getItem('crossclimb-puzzles') || '{}');
    return puzzles[id] || null;
  }
  return null;
}

