'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';

export default function ContinueWatching() {
  const { data: session } = useSession();

  const { data: watchingList, isLoading } = useQuery({
    queryKey: ['my-lists', 'WATCHING'],
    queryFn: async () => {
      const response = await api.get('/lists?status=WATCHING');
      return response.data;
    },
    enabled: !!session,
  });

  if (!session || isLoading || !watchingList || watchingList.length === 0) {
    return null;
  }

  // Filter to only show anime with progress > 0
  const inProgress = watchingList.filter(
    (item: any) => item.progress > 0 && item.progress < (item.anime?.episodes || 999)
  );

  if (inProgress.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-primary-400" size={28} />
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inProgress.slice(0, 6).map((item: any) => {
          const anime = item.anime;
          const progress = item.progress || 0;
          const totalEpisodes = anime?.episodes || 0;
          const percentage = totalEpisodes > 0 ? (progress / totalEpisodes) * 100 : 0;
          const nextEpisode = progress + 1;

          return (
            <Link
              key={item.id}
              href={`/anime/${anime?.id}`}
              className="group bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-all hover:scale-105 border border-slate-700 hover:border-primary-500"
            >
              <div className="relative h-48 w-full">
                {anime?.bannerImage || anime?.coverImage?.large || anime?.coverImage?.medium ? (
                  <Image
                    src={anime.bannerImage || anime.coverImage?.large || anime.coverImage?.medium}
                    alt={anime.title?.english || anime.title?.romaji || 'Anime'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-primary-600 rounded-full p-4">
                    <Play className="text-white" size={32} fill="currentColor" />
                  </div>
                </div>

                {/* Next Episode Badge */}
                <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  EP {nextEpisode}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-1">
                  {anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown'}
                </h3>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                    <span>
                      Episode {progress} of {totalEpisodes || '?'}
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

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Play size={14} />
                  <span>Continue Watching</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
