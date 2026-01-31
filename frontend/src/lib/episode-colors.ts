import { EpisodeType } from '@/types';

export const EPISODE_TYPE_COLORS = {
  CANON: {
    background: 'bg-green-900/20',
    border: 'border-green-700',
    text: 'text-green-400',
    badge: 'bg-green-700/50',
    label: 'Canon',
  },
  FILLER: {
    background: 'bg-yellow-900/20',
    border: 'border-yellow-700',
    text: 'text-yellow-400',
    badge: 'bg-yellow-700/50',
    label: 'Filler',
  },
  MIXED: {
    background: 'bg-orange-900/20',
    border: 'border-orange-700',
    text: 'text-orange-400',
    badge: 'bg-orange-700/50',
    label: 'Mixed Canon/Filler',
  },
} as const;

export const getEpisodeColors = (episodeType: EpisodeType) => {
  return EPISODE_TYPE_COLORS[episodeType];
};

export const EPISODE_TYPE_DESCRIPTIONS = {
  CANON: 'Episodes that follow the main storyline and are essential to the plot',
  FILLER: 'Non-canon episodes that do not advance the main story',
  MIXED: 'Episodes with both canon and filler content, or manga-canon episodes',
} as const;
