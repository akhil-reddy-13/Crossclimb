import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  'AIzaSyCjtaAab3krJRW6tRhBHOVLjOKJGbwgK3Q';

// Lighter model to stay within free-tier limits
const MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `
You write breezy, crossword-style clues for word ladders.
- Keep every clue short (3-8 words), approachable, and non-cryptic.
- Never use the target word or an obvious rhyming giveaway.
- Prefer clear nouns/verbs over flowery phrasing.
- The final two words are the top and bottom rows players must unlock; their shared clue must start with "The top + bottom rows = ".
- Output JSON only, no prose.
`;

type CluePayload = {
  middleWords: string[];
  edgeWords: [string, string];
};

function buildUserPrompt(payload: CluePayload) {
  const { middleWords, edgeWords } = payload;
  return `
Create clues for a word ladder.
- Provide a JSON object: { "middleClues": { "WORD": "clue", ... }, "edgeHint": "clue for the top/bottom rows" }.
- Clues should feel like easy crossword clues, just a few words long.
- The edgeHint must begin with: "The top + bottom rows = ".
- The words are uppercase; return clues for them exactly as provided.

Middle words: ${JSON.stringify(middleWords)}
Top/Bottom words: ${JSON.stringify(edgeWords)}

Return only the JSON object, nothing else.
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CluePayload | null;

    if (
      !body ||
      !Array.isArray(body.middleWords) ||
      body.middleWords.length === 0 ||
      !Array.isArray(body.edgeWords) ||
      body.edgeWords.length !== 2
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const chatResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: SYSTEM_PROMPT.trim() }],
          },
          {
            parts: [{ text: buildUserPrompt(body).trim() }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Clue generation failed:', chatResponse.status, errorText);
      return NextResponse.json({ error: 'Failed to generate clues' }, { status: chatResponse.status });
    }

    const completion = await chatResponse.json();
    const text =
      completion?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || '')
        .join('') || '';

    // Gemini may wrap JSON in fences; strip them before parsing
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      // Try to salvage the first JSON object in the text
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error('Failed to parse clue response:', cleaned);
          return NextResponse.json({ error: 'Bad clue format from model' }, { status: 502 });
        }
      } else {
        console.error('Failed to parse clue response:', cleaned);
        return NextResponse.json({ error: 'Bad clue format from model' }, { status: 502 });
      }
    }

    return NextResponse.json({ success: true, clues: parsed });
  } catch (error) {
    console.error('Unexpected error generating clues:', error);
    return NextResponse.json({ error: 'Server error while generating clues' }, { status: 500 });
  }
}

