# Crossclimb - Custom Word Ladder Puzzle Game

A custom version of LinkedIn's Crossclimb game where you can create your own word ladder puzzles!

## Features

- **Auto-Generate Mode**: Choose your starting and ending words, and the system automatically generates the middle words and clues
- **Manual Creation Mode**: Design your own puzzle by creating all words and clues manually
- **Interactive Gameplay**: 
  - Type letters to guess words
  - Drag and drop to reorder words
  - Real-time timer
  - Visual feedback and hints
- **Completion Screen**: Share your results with friends via Post, Send, or Copy

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment

- Set `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) for AI-generated clues in auto-generate mode.

## How to Play

1. **Choose a Mode**:
   - **Auto-Generate**: Enter a starting and ending word. The system will find a word ladder path and generate hints
   - **Manual**: Create your own puzzle by entering all words and their hints

2. **Solve the Puzzle**:
   - Guess each middle word using the provided clues
   - Drag words to reorder them so each word differs by exactly one letter
   - Once sorted, the top and bottom words unlock
   - Guess the edge words using the shared hint

3. **Share Your Results**:
   - When completed, share your time and score with friends!

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy
4. Your app will be live!

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@dnd-kit** - Drag and drop functionality

## Project Structure

```
Crossclimb/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Word.tsx          # Individual word input component
│   ├── SortableWordList.tsx  # Drag & drop word list
│   ├── GameBoard.tsx     # Main game interface
│   ├── CompletionScreen.tsx  # Results screen
│   ├── ModeSelection.tsx # Mode selection screen
│   ├── AutoGenerateMode.tsx  # Auto-generation UI
│   └── ManualMode.tsx    # Manual creation UI
├── hooks/                 # Custom React hooks
│   └── useGame.ts        # Game state management
├── types/                 # TypeScript types
│   └── game.ts           # Game-related types
└── utils/                 # Utility functions
    ├── wordLadder.ts     # Word ladder algorithms
    └── gameGenerator.ts  # Game generation logic
```

## Notes

- The word ladder generation uses a simplified dictionary. For production use, consider integrating with a comprehensive word dictionary API
- The current implementation works best with 4-letter words
- Custom hints are required in manual mode

## License

MIT

