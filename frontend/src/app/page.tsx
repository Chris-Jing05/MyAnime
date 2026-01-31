'use client';

import Link from 'next/link';
import { TrendingAnime } from '@/components/TrendingAnime';
import ContinueWatching from '@/components/ContinueWatching';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-16 pt-20">
        <h1 className="text-6xl font-bold text-white mb-4">
          Welcome to <span className="text-primary-400">MyAnime</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Track your favorite anime, discover new shows, and connect with fellow fans
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/browse"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
          >
            Browse Anime
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Continue Watching Section (only shows for logged-in users with progress) */}
      <ContinueWatching />

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">Trending Now</h2>
        <TrendingAnime />
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-3">Track Your Progress</h3>
          <p className="text-gray-300">
            Keep track of what you're watching, completed, or plan to watch
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-3">Get Recommendations</h3>
          <p className="text-gray-300">
            Discover new anime based on your preferences and watch history
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-3">Join the Community</h3>
          <p className="text-gray-300">
            Connect with fans, write reviews, and join clubs
          </p>
        </div>
      </section>
    </div>
  );
}
