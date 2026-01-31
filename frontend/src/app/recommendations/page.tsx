'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimeCard } from '@/components/AnimeCard';
import { Anime } from '@/types';

export default function RecommendationsPage() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await api.get('/recommendations?limit=20');
      return response.data as Anime[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-4">Recommended for You</h1>
      <p className="text-gray-300 mb-8">
        Based on your watching history and preferences
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-800 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendations.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800/50 rounded-lg">
          <p className="text-gray-400 text-lg mb-4">
            Start rating anime to get personalized recommendations!
          </p>
        </div>
      )}
    </div>
  );
}
