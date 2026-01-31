export type EpisodeType = 'CANON' | 'FILLER' | 'MIXED';

export interface Episode {
  id: string;
  animeId: number;
  number: number;
  title?: string;
  description?: string;
  thumbnail?: string;
  streamingUrl?: string;
  isFiller: boolean;
  isManga: boolean;
  episodeType: EpisodeType;
  airingDate?: string;
}

export interface Anime {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage?: {
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  genres?: string[];
  tags?: string[];
  averageScore?: number;
  popularity?: number;
  episodes?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  format?: string;
  episodeList?: Episode[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface AnimeList {
  id: string;
  animeId: number;
  status: 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'DROPPED' | 'ON_HOLD';
  score?: number;
  progress: number;
  anime: Anime;
}

export interface Review {
  id: string;
  userId: string;
  animeId: number;
  rating: number;
  title: string;
  content: string;
  spoilers: boolean;
  helpfulCount: number;
  user: User;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  isPublic: boolean;
  _count?: {
    members: number;
    posts: number;
  };
}

export interface Activity {
  id: string;
  userId: string;
  type: 'LIST_UPDATE' | 'REVIEW_POSTED' | 'CLUB_JOINED' | 'CLUB_POST' | 'ANIME_COMPLETED';
  metadata: any;
  createdAt: string;
  user: User;
}
