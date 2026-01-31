'use client';

import { Check } from 'lucide-react';

interface EpisodeProgressProps {
  currentProgress: number;
  totalEpisodes: number;
  onProgressChange?: (newProgress: number) => void;
  loading?: boolean;
}

export default function EpisodeProgress({
  currentProgress,
  totalEpisodes,
  onProgressChange,
  loading = false,
}: EpisodeProgressProps) {
  const percentage = totalEpisodes > 0 ? (currentProgress / totalEpisodes) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Check className="text-green-400" size={20} />
          <span className="text-white font-semibold">
            Progress: {currentProgress} / {totalEpisodes} episodes
          </span>
        </div>
        <span className="text-gray-400 text-sm">{Math.round(percentage)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Quick Actions */}
      {onProgressChange && !loading && (
        <div className="flex gap-2 mt-3">
          {currentProgress > 0 && (
            <button
              onClick={() => onProgressChange(currentProgress - 1)}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition"
            >
              -1 Episode
            </button>
          )}
          {currentProgress < totalEpisodes && (
            <button
              onClick={() => onProgressChange(currentProgress + 1)}
              className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded transition"
            >
              +1 Episode
            </button>
          )}
          {currentProgress !== totalEpisodes && (
            <button
              onClick={() => onProgressChange(totalEpisodes)}
              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Mark Completed
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-3 text-sm text-gray-400">Updating progress...</div>
      )}
    </div>
  );
}
