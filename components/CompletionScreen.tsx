'use client';

import { useState } from 'react';
import { Game } from '@/types/game';

interface CompletionScreenProps {
  game: Game;
  time: number;
  onBack: () => void;
}

export default function CompletionScreen({
  game,
  time,
  onBack,
}: CompletionScreenProps) {
  const [copied, setCopied] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAvgTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = game.title || 'Crossclimb';
    const shareText = `Crossclimb "${title}" | ${formatTime(time)} 🪜\n${url}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePost = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = game.title || 'Crossclimb';
    const shareText = `I solved '${title}' crossclimb`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareText);
    // Open share dialog or redirect to social media
    if (typeof window !== 'undefined') {
      window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
    }
  };

  const handleSend = () => {
    if (typeof window === 'undefined') return;
    
    const url = window.location.href;
    const title = game.title || 'Crossclimb';
    const shareText = `Crossclimb "${title}" | ${formatTime(time)} 🪜\n${url}`;
    
    // Use mailto or Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Crossclimb',
        text: shareText,
        url: url,
      });
    } else {
      window.location.href = `mailto:?subject=Crossclimb Solved&body=${encodeURIComponent(shareText)}`;
    }
  };

  const avgTime = 89; // Mock average time in seconds

  return (
    <div className="min-h-screen bg-[#212121] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="text-yellow-400 text-3xl">🪜</div>
            <h1 className="text-2xl font-bold text-white">{game.title || 'Crossclimb'}</h1>
          </div>
          <h2 className="text-3xl font-bold text-white">You&apos;re crushing it!</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#F5F5DC] rounded-lg p-4 text-center">
            <div className="text-5xl mb-2">🔥</div>
            <div className="text-base font-semibold text-gray-800">On fire</div>
          </div>

          <div className="bg-[#F5F5DC] rounded-lg p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200 transform rotate-45 translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-800">{formatTime(time)}</div>
          </div>

          <div className="bg-[#F5F5DC] rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🧠</div>
            <div className="text-sm font-semibold text-gray-800">Super smart!</div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePost}
            className="flex flex-col items-center gap-1 p-4 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-[#0a1f1f]"
            >
              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            <span className="text-xs text-[#0a1f1f]">Post</span>
          </button>

          <button
            onClick={handleSend}
            className="flex flex-col items-center gap-1 p-4 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-[#0a1f1f]"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <span className="text-xs text-[#0a1f1f]">Send</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1 p-4 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-[#0a1f1f]"
            >
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            <span className="text-xs text-[#0a1f1f]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-[#0077B5] hover:bg-[#006399] text-white rounded transition-colors"
          >
            Create New Puzzle
          </button>
        </div>
      </div>
    </div>
  );
}

