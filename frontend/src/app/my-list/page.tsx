'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { AnimeList } from '@/types';
import { useState } from 'react';

export default function MyListPage() {
  const [activeTab, setActiveTab] = useState<string>('WATCHING');

  const { data: lists, isLoading } = useQuery({
    queryKey: ['my-lists', activeTab],
    queryFn: async () => {
      const response = await api.get('/lists', {
        params: { status: activeTab },
      });
      return response.data as AnimeList[];
    },
  });

  const tabs = [
    { key: 'WATCHING', label: 'Watching' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'PLAN_TO_WATCH', label: 'Plan to Watch' },
    { key: 'ON_HOLD', label: 'On Hold' },
    { key: 'DROPPED', label: 'Dropped' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">My Anime List</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-800 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : lists && lists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lists.map((list) => {
            const totalEpisodes = list.anime.episodes || 0;
            const progress = list.progress || 0;
            const percentage = totalEpisodes > 0 ? (progress / totalEpisodes) * 100 : 0;

            return (
              <div key={list.id} className="relative">
                <AnimeCard anime={list.anime} />

                {/* Progress Bar */}
                {totalEpisodes > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>
                        {progress}/{totalEpisodes} eps
                      </span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {list.score && (
                  <div className="mt-1 text-sm text-yellow-400">★ {list.score}/10</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No anime in this list yet</p>
          <button className="mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition">
            Browse Anime
          </button>
        </div>
      )}
    </div>
  );
}
