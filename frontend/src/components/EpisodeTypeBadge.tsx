import { EpisodeType } from '@/types';
import { getEpisodeColors, EPISODE_TYPE_DESCRIPTIONS } from '@/lib/episode-colors';

interface EpisodeTypeBadgeProps {
  episodeType: EpisodeType;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function EpisodeTypeBadge({
  episodeType,
  showTooltip = true,
  size = 'sm',
}: EpisodeTypeBadgeProps) {
  const colors = getEpisodeColors(episodeType);
  const description = EPISODE_TYPE_DESCRIPTIONS[episodeType];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colors.badge} ${colors.text} ${sizeClasses[size]}`}
      title={showTooltip ? description : undefined}
    >
      {colors.label}
    </span>
  );
}
