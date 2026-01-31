import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FillerListService } from '@/common/external-apis/fillerlist.service';
import { AniListService } from '@/common/external-apis/anilist.service';
import { EpisodeType } from './enums/episode-type.enum';

@Injectable()
export class EpisodeService {
  constructor(
    private prisma: PrismaService,
    private fillerListService: FillerListService,
    private anilistService: AniListService,
  ) {}

  /**
   * Determine episode type based on filler and manga flags
   * - FILLER: isFiller = true
   * - MIXED: isManga = true (manga canon or mixed content)
   * - CANON: default (both flags false)
   */
  private getEpisodeType(isFiller: boolean, isManga: boolean): EpisodeType {
    if (isFiller) return EpisodeType.FILLER;
    if (isManga) return EpisodeType.MIXED;
    return EpisodeType.CANON;
  }

  async getEpisodesByAnime(animeId: number) {
    const episodes = await this.prisma.episode.findMany({
      where: { animeId },
      orderBy: { number: 'asc' },
    });

    // Map episodes to include episodeType
    return episodes.map(episode => ({
      ...episode,
      episodeType: this.getEpisodeType(episode.isFiller, episode.isManga),
    }));
  }

  async getEpisodeByNumber(animeId: number, episodeNumber: number) {
    const episode = await this.prisma.episode.findUnique({
      where: {
        animeId_number: {
          animeId,
          number: episodeNumber,
        },
      },
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            coverImage: true,
          },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException(`Episode ${episodeNumber} not found for anime ${animeId}`);
    }

    return {
      ...episode,
      episodeType: this.getEpisodeType(episode.isFiller, episode.isManga),
    };
  }

  async getNextAiringEpisode(animeId: number) {
    const anime = await this.prisma.anime.findUnique({
      where: { id: animeId },
      select: { nextAiringEpisode: true, title: true },
    });

    if (!anime || !anime.nextAiringEpisode) {
      return null;
    }

    return {
      anime: { id: animeId, title: anime.title },
      ...(anime.nextAiringEpisode as object),
    };
  }

  async getAiringSchedule(page = 1, perPage = 20) {
    const data = await this.anilistService.getAiringSchedule(page, perPage, true);
    return data;
  }

  /**
   * Sync filler data from AnimeFillerList.com
   * @param animeId - AniList anime ID
   * @param animeSlug - URL slug for animefillerlist.com (e.g., "naruto", "one-piece")
   */
  async syncFillerData(animeId: number, animeSlug: string) {
    const fillerData = await this.fillerListService.getFillerEpisodes(animeSlug);

    if (fillerData.length === 0) {
      console.log(`No filler data found for ${animeSlug}`);
      return { synced: 0, message: 'No filler data available' };
    }

    let syncedCount = 0;

    // Bulk upsert episodes
    for (const ep of fillerData) {
      await this.prisma.episode.upsert({
        where: {
          animeId_number: {
            animeId,
            number: ep.episodeNumber,
          },
        },
        update: {
          isFiller: ep.isFiller,
          isManga: ep.isManga,
        },
        create: {
          animeId,
          number: ep.episodeNumber,
          isFiller: ep.isFiller,
          isManga: ep.isManga,
        },
      });
      syncedCount++;
    }

    return { synced: syncedCount, message: `Synced ${syncedCount} episodes` };
  }

  /**
   * Sync episode data from AniList (streaming episodes, next airing, etc.)
   */
  async syncEpisodesFromAniList(animeId: number) {
    const anilistData = await this.anilistService.getAnimeById(animeId);
    const media = anilistData.Media;

    // Update next airing episode in anime table
    if (media.nextAiringEpisode) {
      await this.prisma.anime.update({
        where: { id: animeId },
        data: {
          nextAiringEpisode: media.nextAiringEpisode,
        },
      });
    }

    let syncedCount = 0;

    // First, try to sync streaming episodes
    if (media.streamingEpisodes && media.streamingEpisodes.length > 0) {
      for (const ep of media.streamingEpisodes) {
        const episodeMatch = ep.title?.match(/Episode\s+(\d+)/i);
        if (!episodeMatch) continue;

        const episodeNumber = parseInt(episodeMatch[1]);

        await this.prisma.episode.upsert({
          where: {
            animeId_number: {
              animeId,
              number: episodeNumber,
            },
          },
          update: {
            title: ep.title,
            thumbnail: ep.thumbnail,
            streamingUrl: ep.url,
          },
          create: {
            animeId,
            number: episodeNumber,
            title: ep.title,
            thumbnail: ep.thumbnail,
            streamingUrl: ep.url,
          },
        });
        syncedCount++;
      }
    }

    // If no streaming episodes but we have episode count, create placeholder episodes
    if (syncedCount === 0 && media.episodes) {
      console.log(`Creating ${media.episodes} placeholder episodes for anime ${animeId}`);

      for (let episodeNumber = 1; episodeNumber <= media.episodes; episodeNumber++) {
        await this.prisma.episode.upsert({
          where: {
            animeId_number: {
              animeId,
              number: episodeNumber,
            },
          },
          update: {
            // Don't overwrite existing data, just ensure episode exists
          },
          create: {
            animeId,
            number: episodeNumber,
            title: `Episode ${episodeNumber}`,
          },
        });
        syncedCount++;
      }
    }

    return {
      synced: syncedCount,
      nextAiring: media.nextAiringEpisode,
      message: `Synced ${syncedCount} episodes from AniList`,
    };
  }
}
