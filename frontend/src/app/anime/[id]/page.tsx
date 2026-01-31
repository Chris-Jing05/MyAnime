'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Plus, Check, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Episode } from '@/types';
import EpisodeTypeBadge from '@/components/EpisodeTypeBadge';
import { getEpisodeColors } from '@/lib/episode-colors';
import EpisodeProgress from '@/components/EpisodeProgress';

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const animeId = params.id as string;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { data: anime, isLoading } = useQuery({
    queryKey: ['anime', animeId],
    queryFn: async () => {
      const response = await api.get(`/anime/${animeId}`);
      return response.data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', animeId],
    queryFn: async () => {
      const response = await api.get(`/reviews/anime/${animeId}`);
      return response.data;
    },
  });

  // Check if anime is already in user's list
  const { data: listEntry } = useQuery({
    queryKey: ['list-entry', animeId],
    queryFn: async () => {
      const response = await api.get(`/lists/${animeId}`);
      return response.data;
    },
    enabled: !!session,
  });

  // Mutation to add to list
  const addToListMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.post('/lists', {
        animeId: parseInt(animeId),
        status,
        progress: 0,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-entry', animeId] });
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      setShowStatusMenu(false);
    },
  });

  // Mutation to update progress
  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      const response = await api.put(`/lists/${animeId}/progress`, {
        progress: newProgress,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-entry', animeId] });
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
    },
  });

  const handleProgressChange = (newProgress: number) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    if (!listEntry) {
      // Auto-add to watching list if not in list
      addToListMutation.mutate('WATCHING');
      setTimeout(() => {
        updateProgressMutation.mutate(newProgress);
      }, 500);
    } else {
      updateProgressMutation.mutate(newProgress);
    }
  };

  const handleEpisodeClick = (episodeNumber: number) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    handleProgressChange(episodeNumber);
  };

  const handleAddToList = (status: string) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    addToListMutation.mutate(status);
  };

  const statuses = [
    { key: 'WATCHING', label: 'Watching' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'PLAN_TO_WATCH', label: 'Plan to Watch' },
    { key: 'ON_HOLD', label: 'On Hold' },
    { key: 'DROPPED', label: 'Dropped' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!anime) {
    return <div className="text-white p-8">Anime not found</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      {anime.bannerImage && (
        <div className="relative h-96 w-full">
          <Image
            src={anime.bannerImage}
            alt={anime.title?.english || anime.title?.romaji || 'Anime'}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex gap-8 flex-col md:flex-row">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="relative w-56 h-80 rounded-lg overflow-hidden shadow-2xl">
              {(anime.coverImage?.large || anime.coverImage?.medium) ? (
                <Image
                  src={anime.coverImage.large || anime.coverImage.medium}
                  alt={anime.title?.english || anime.title?.romaji || 'Anime'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-800" />
              )}
            </div>
            <div className="relative mt-4">
              {listEntry ? (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
                  <Check size={20} />
                  In List
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    disabled={addToListMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white rounded-lg font-medium transition"
                  >
                    <Plus size={20} />
                    {addToListMutation.isPending ? 'Adding...' : 'Add to List'}
                  </button>
                  {showStatusMenu && (
                    <div className="absolute top-full mt-2 w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-10">
                      {statuses.map((status) => (
                        <button
                          key={status.key}
                          onClick={() => handleAddToList(status.key)}
                          className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition"
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">
              {anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown'}
            </h1>
            {anime.title?.romaji && anime.title.romaji !== (anime.title?.english || anime.title?.native) && (
              <p className="text-gray-400 mb-4">{anime.title.romaji}</p>
            )}

            <div className="flex items-center gap-4 mb-6">
              {anime.averageScore && (
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400" fill="currentColor" />
                  <span className="text-white font-semibold">
                    {anime.averageScore / 10}/10
                  </span>
                </div>
              )}
              <span className="text-gray-400">{anime.format}</span>
              <span className="text-gray-400">{anime.episodes} episodes</span>
              <span className="text-gray-400">{anime.status}</span>
            </div>

            {/* Genres */}
            <div className="flex gap-2 flex-wrap mb-6">
              {anime.genres?.map((genre: string) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-primary-600/20 text-primary-300 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Synopsis</h2>
              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: anime.description?.replace(/<br>/g, '<br />') || 'No description available',
                }}
              />
            </div>

            {/* Episodes */}
            {anime.episodeList && anime.episodeList.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">Episodes</h2>

                {/* Progress Tracker (only show if in user's list) */}
                {listEntry && (
                  <EpisodeProgress
                    currentProgress={listEntry.progress || 0}
                    totalEpisodes={anime.episodes || anime.episodeList.length}
                    onProgressChange={handleProgressChange}
                    loading={updateProgressMutation.isPending}
                  />
                )}

                {/* Episode Type Legend */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-gray-400 text-sm font-medium">Legend:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-700/50"></div>
                    <span className="text-gray-300 text-sm">Canon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-700/50"></div>
                    <span className="text-gray-300 text-sm">Filler</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-700/50"></div>
                    <span className="text-gray-300 text-sm">Mixed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span className="text-gray-300 text-sm">Watched</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {anime.episodeList.map((episode: Episode) => {
                    const colors = getEpisodeColors(episode.episodeType);
                    const isWatched = listEntry && episode.number <= (listEntry.progress || 0);
                    return (
                      <button
                        key={episode.id}
                        onClick={() => handleEpisodeClick(episode.number)}
                        disabled={updateProgressMutation.isPending}
                        className={`p-3 rounded-lg border ${colors.background} ${colors.border} transition-all hover:scale-105 hover:shadow-lg text-left relative ${
                          isWatched ? 'opacity-70' : ''
                        } ${updateProgressMutation.isPending ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isWatched && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 size={20} className="text-green-400" fill="currentColor" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-white font-medium">Episode {episode.number}</span>
                          <EpisodeTypeBadge episodeType={episode.episodeType} size="sm" />
                        </div>
                        {episode.title && (
                          <p className="text-gray-400 text-xs line-clamp-2">{episode.title}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Reviews</h2>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="bg-slate-800 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-white">{review.user.name}</div>
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400" fill="currentColor" />
                          <span className="text-white">{review.rating}/10</span>
                        </div>
                      </div>
                      <h3 className="font-medium text-white mb-2">{review.title}</h3>
                      <p className="text-gray-300 line-clamp-3">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
