'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function SyncPage() {
  const [animeId, setAnimeId] = useState('');
  const [animeSlug, setAnimeSlug] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const syncEpisodes = async () => {
    if (!animeId) {
      setResult('Please enter an Anime ID');
      return;
    }

    setLoading(true);
    setResult('Syncing episodes from AniList...');

    try {
      const response = await api.post(`/episodes/anime/${animeId}/sync`);
      setResult(`Success! ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncFillers = async () => {
    if (!animeId || !animeSlug) {
      setResult('Please enter both Anime ID and Anime Slug');
      return;
    }

    setLoading(true);
    setResult('Syncing filler data from AnimeFillerList.com...');

    try {
      const response = await api.post(`/episodes/anime/${animeId}/sync-fillers`, {
        animeSlug: animeSlug,
      });
      setResult(`Success! ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncBoth = async () => {
    if (!animeId || !animeSlug) {
      setResult('Please enter both Anime ID and Anime Slug');
      return;
    }

    setLoading(true);

    try {
      // First sync episodes
      setResult('Step 1/2: Syncing episodes from AniList...');
      const episodesResponse = await api.post(`/episodes/anime/${animeId}/sync`);

      // Then sync fillers
      setResult('Step 2/2: Syncing filler data...');
      const fillersResponse = await api.post(`/episodes/anime/${animeId}/sync-fillers`, {
        animeSlug: animeSlug,
      });

      setResult(`Success!\n\nEpisodes: ${JSON.stringify(episodesResponse.data, null, 2)}\n\nFillers: ${JSON.stringify(fillersResponse.data, null, 2)}`);
    } catch (error: any) {
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const popularAnime = [
    { id: '20', slug: 'naruto', name: 'Naruto' },
    { id: '21', slug: 'one-piece', name: 'One Piece' },
    { id: '269', slug: 'bleach', name: 'Bleach' },
    { id: '1535', slug: 'death-note', name: 'Death Note' },
    { id: '6702', slug: 'fairy-tail', name: 'Fairy Tail' },
    { id: '31964', slug: 'boku-no-hero-academia', name: 'My Hero Academia' },
  ];

  const quickSync = (id: string, slug: string) => {
    setAnimeId(id);
    setAnimeSlug(slug);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Sync Filler Data</h1>

        {/* Quick Select */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Select Popular Anime</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularAnime.map((anime) => (
              <button
                key={anime.id}
                onClick={() => quickSync(anime.id, anime.slug)}
                className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                {anime.name}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Or Enter Manually</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anime ID (from AniList)
              </label>
              <input
                type="text"
                value={animeId}
                onChange={(e) => setAnimeId(e.target.value)}
                placeholder="e.g., 20"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none"
              />
              <p className="text-sm text-gray-400 mt-1">
                Find the ID in the URL: anilist.co/anime/<span className="text-primary-400">20</span>/naruto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anime Slug (from AnimeFillerList.com)
              </label>
              <input
                type="text"
                value={animeSlug}
                onChange={(e) => setAnimeSlug(e.target.value)}
                placeholder="e.g., naruto"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none"
              />
              <p className="text-sm text-gray-400 mt-1">
                Find the slug in the URL: animefillerlist.com/shows/<span className="text-primary-400">naruto</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Sync Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={syncEpisodes}
              disabled={loading || !animeId}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            >
              1. Sync Episodes
            </button>
            <button
              onClick={syncFillers}
              disabled={loading || !animeId || !animeSlug}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            >
              2. Sync Fillers
            </button>
            <button
              onClick={syncBoth}
              disabled={loading || !animeId || !animeSlug}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            >
              Do Both
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Recommended: Click "Do Both" to sync episodes and filler data in one go
          </p>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Result</h2>
            <pre className="bg-slate-900 p-4 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Either click a popular anime button or enter the Anime ID and Slug manually</li>
            <li>Click "Do Both" to sync episodes and filler data automatically</li>
            <li>Wait for the success message</li>
            <li>Go to the anime detail page to see the color-coded episodes!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
