import Link from 'next/link';
import Image from 'next/image';
import { Anime } from '@/types';
import { Star } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime.title.english || anime.title.romaji || anime.title.native || 'Unknown';
  const imageUrl = anime.coverImage?.large || anime.coverImage?.medium;

  return (
    <Link href={`/anime/${anime.id}`} className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-slate-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 p-3 w-full">
            <p className="text-white font-medium text-sm line-clamp-2">
              {title}
            </p>
            {anime.averageScore && (
              <div className="flex items-center gap-1 mt-1 text-yellow-400">
                <Star size={14} fill="currentColor" />
                <span className="text-xs">{anime.averageScore / 10}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <h3 className="mt-2 text-sm font-medium text-white line-clamp-2">
        {title}
      </h3>
    </Link>
  );
}
