'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from './AnimeCard';
import { Anime } from '@/types';

export function TrendingAnime() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      try {
        const response = await api.get('/anime/trending?perPage=10');
        console.log('Trending API response:', response.data);
        return response.data.Page.media as Anime[];
      } catch (err) {
        console.error('Failed to fetch trending anime:', err);
        throw err;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-80 bg-slate-800 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Trending anime error:', error);
    return (
      <div className="text-red-400">
        <p>Failed to load trending anime</p>
        <p className="text-sm mt-2">Check the console for more details</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {data?.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
