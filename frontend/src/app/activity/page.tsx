'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Activity } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ActivityPage() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const response = await api.get('/activity');
      return response.data as Activity[];
    },
  });

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'LIST_UPDATE':
        return `added ${activity.metadata.animeTitle} to their ${activity.metadata.status.toLowerCase().replace('_', ' ')} list`;
      case 'ANIME_COMPLETED':
        return `completed ${activity.metadata.animeTitle}`;
      case 'REVIEW_POSTED':
        return `posted a review for ${activity.metadata.animeTitle}`;
      case 'CLUB_JOINED':
        return `joined the club ${activity.metadata.clubName}`;
      case 'CLUB_POST':
        return `posted in ${activity.metadata.clubName}`;
      default:
        return 'performed an activity';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Activity Feed</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="bg-slate-800/50 backdrop-blur p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {activity.user.name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-semibold">{activity.user.name || 'User'}</span>{' '}
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-sm text-gray-400">{formatDate(activity.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
