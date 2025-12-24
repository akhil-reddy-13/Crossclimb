import { NextRequest, NextResponse } from 'next/server';
import { GameInfo } from '@/types/game';

// In-memory store for puzzles (in production, use a database)
const puzzleStore: Record<string, GameInfo & { createdAt: string }> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, gameInfo } = body;

    if (!id || !gameInfo) {
      return NextResponse.json(
        { error: 'Missing id or gameInfo' },
        { status: 400 }
      );
    }

    // Save puzzle
    puzzleStore[id] = {
      ...gameInfo,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to save puzzle' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing puzzle id' },
        { status: 400 }
      );
    }

    const puzzle = puzzleStore[id];

    if (!puzzle) {
      return NextResponse.json(
        { error: 'Puzzle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(puzzle);
  } catch (error) {
    console.error('Error loading puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to load puzzle' },
      { status: 500 }
    );
  }
}

