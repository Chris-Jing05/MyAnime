'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Users, MessageSquare, Crown, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface ClubMember {
  id: string;
  role: 'OWNER' | 'MODERATOR' | 'MEMBER';
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ClubPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Club {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  members: ClubMember[];
  posts: ClubPost[];
}

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const clubId = params.id as string;

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const { data: club, isLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const response = await api.get(`/clubs/${clubId}`);
      return response.data as Club;
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/clubs/${clubId}/join`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await api.post(`/clubs/${clubId}/posts`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
      setShowCreatePost(false);
      setPostTitle('');
      setPostContent('');
    },
  });

  const handleJoin = () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    joinMutation.mutate();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/login');
      return;
    }
    createPostMutation.mutate({ title: postTitle, content: postContent });
  };

  const isMember = club?.members.some((m) => m.user.id === session?.user?.id);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="text-yellow-400" size={16} />;
      case 'MODERATOR':
        return <Shield className="text-blue-400" size={16} />;
      default:
        return <User className="text-gray-400" size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!club) {
    return <div className="text-white p-8">Club not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Club Header */}
      <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{club.name}</h1>
            <p className="text-gray-300">{club.description}</p>
          </div>
          {!isMember && (
            <button
              onClick={handleJoin}
              disabled={joinMutation.isPending}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white rounded-lg font-medium transition"
            >
              {joinMutation.isPending ? 'Joining...' : 'Join Club'}
            </button>
          )}
        </div>

        <div className="flex gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Users size={16} />
            {club.members.length} members
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            {club.posts.length} posts
          </div>
          <div>{club.isPublic ? 'Public' : 'Private'}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Posts */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Posts</h2>
            {isMember && (
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"
              >
                {showCreatePost ? 'Cancel' : 'New Post'}
              </button>
            )}
          </div>

          {/* Create Post Form */}
          {showCreatePost && (
            <form onSubmit={handleCreatePost} className="bg-slate-800/50 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white rounded-lg transition"
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {club.posts.length === 0 ? (
              <div className="bg-slate-800/50 rounded-lg p-8 text-center text-gray-400">
                No posts yet. {isMember && 'Be the first to post!'}
              </div>
            ) : (
              club.posts.map((post) => (
                <div key={post.id} className="bg-slate-800/50 backdrop-blur rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{post.user.name}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                  <p className="text-gray-300">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Members Sidebar */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Members</h2>
          <div className="space-y-3">
            {club.members.map((member) => (
              <div
                key={member.id}
                className="bg-slate-800/50 backdrop-blur rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{member.user.name}</div>
                    <div className="text-sm text-gray-400 capitalize">
                      {member.role.toLowerCase()}
                    </div>
                  </div>
                </div>
                {getRoleIcon(member.role)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
