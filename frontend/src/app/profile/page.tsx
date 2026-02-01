'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, Calendar, TrendingUp, CheckCircle2, Clock, Star } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const { data: lists, isLoading: listsLoading } = useQuery({
    queryKey: ['my-lists'],
    queryFn: async () => {
      const response = await api.get('/lists');
      return response.data;
    },
    enabled: !!session,
  });

  if (status === 'loading' || listsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Calculate statistics
  const stats = {
    watching: lists?.filter((l: any) => l.status === 'WATCHING').length || 0,
    completed: lists?.filter((l: any) => l.status === 'COMPLETED').length || 0,
    planToWatch: lists?.filter((l: any) => l.status === 'PLAN_TO_WATCH').length || 0,
    onHold: lists?.filter((l: any) => l.status === 'ON_HOLD').length || 0,
    dropped: lists?.filter((l: any) => l.status === 'DROPPED').length || 0,
    totalAnime: lists?.length || 0,
    totalEpisodes: lists?.reduce((acc: number, l: any) => acc + (l.progress || 0), 0) || 0,
    averageScore: lists?.filter((l: any) => l.score).length > 0
      ? (lists?.reduce((acc: number, l: any) => acc + (l.score || 0), 0) / lists?.filter((l: any) => l.score).length).toFixed(1)
      : 'N/A',
  };

  const memberSince = new Date(session.user?.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center text-white text-4xl font-bold">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {session.user?.name || 'User'}
              </h1>
              <p className="text-gray-400 mb-4">{session.user?.email}</p>

              <div className="flex items-center gap-2 text-gray-300">
                <Calendar size={18} />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Anime */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600/20 rounded-lg">
                <TrendingUp className="text-primary-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Anime</p>
                <p className="text-2xl font-bold text-white">{stats.totalAnime}</p>
              </div>
            </div>
          </div>

          {/* Total Episodes */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <CheckCircle2 className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Episodes Watched</p>
                <p className="text-2xl font-bold text-white">{stats.totalEpisodes}</p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <Star className="text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{stats.averageScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Anime Status Breakdown</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="text-blue-400" size={20} />
                <p className="text-gray-300 font-medium">Watching</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.watching}</p>
            </div>

            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="text-green-400" size={20} />
                <p className="text-gray-300 font-medium">Completed</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
            </div>

            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="text-purple-400" size={20} />
                <p className="text-gray-300 font-medium">Plan to Watch</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.planToWatch}</p>
            </div>

            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="text-yellow-400" size={20} />
                <p className="text-gray-300 font-medium">On Hold</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.onHold}</p>
            </div>

            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="text-red-400" size={20} />
                <p className="text-gray-300 font-medium">Dropped</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.dropped}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/my-list')}
              className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
            >
              View My List
            </button>

            <button
              onClick={() => router.push('/browse')}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Browse Anime
            </button>

            <button
              onClick={() => router.push('/recommendations')}
              className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              Get Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
