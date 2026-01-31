import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AniListService } from '@/common/external-apis/anilist.service';
import { SearchAnimeDto } from './dto/search-anime.dto';
import { EpisodeType } from '../episode/enums/episode-type.enum';

@Injectable()
export class AnimeService {
  constructor(
    private prisma: PrismaService,
    private anilistService: AniListService,
  ) {}

  async search(searchDto: SearchAnimeDto) {
    return this.anilistService.searchAnime(searchDto);
  }

  async findById(id: number) {
    try {
      // Check cache in database
      const cachedAnime = await this.prisma.anime.findUnique({
        where: { id },
        include: {
          episodeList: {
            orderBy: { number: 'asc' },
          },
        },
      });

      // If cache is recent (less than 24 hours), return it
      if (
        cachedAnime &&
        cachedAnime.cachedAt &&
        cachedAnime.cachedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ) {
        return this.transformAnimeForApi(cachedAnime);
      }
    } catch (error) {
      console.log('Database cache check failed, fetching from AniList:', error.message);
    }

    // Fetch from AniList
    const anilistData = await this.anilistService.getAnimeById(id);
    const media = anilistData.Media;

    // Try to cache the data in database
    try {
      const anime = await this.prisma.anime.upsert({
        where: { id },
        update: {
          title: media.title.romaji,
          titleEnglish: media.title.english,
          titleRomaji: media.title.romaji,
          description: media.description,
          coverImage: media.coverImage?.large,
          bannerImage: media.bannerImage,
          genres: media.genres || [],
          tags: media.tags?.map((t: any) => t.name) || [],
          averageScore: media.averageScore,
          popularity: media.popularity,
          episodes: media.episodes,
          status: media.status,
          season: media.season,
          seasonYear: media.seasonYear,
          format: media.format,
          startDate: this.parseDate(media.startDate),
          endDate: this.parseDate(media.endDate),
          studios: media.studios?.nodes?.map((s: any) => s.name) || [],
          externalLinks: media.externalLinks || [],
          nextAiringEpisode: media.nextAiringEpisode || null,
          cachedAt: new Date(),
        },
        create: {
          id,
          title: media.title.romaji,
          titleEnglish: media.title.english,
          titleRomaji: media.title.romaji,
          description: media.description,
          coverImage: media.coverImage?.large,
          bannerImage: media.bannerImage,
          genres: media.genres || [],
          tags: media.tags?.map((t: any) => t.name) || [],
          averageScore: media.averageScore,
          popularity: media.popularity,
          episodes: media.episodes,
          status: media.status,
          season: media.season,
          seasonYear: media.seasonYear,
          format: media.format,
          startDate: this.parseDate(media.startDate),
          endDate: this.parseDate(media.endDate),
          studios: media.studios?.nodes?.map((s: any) => s.name) || [],
          externalLinks: media.externalLinks || [],
          nextAiringEpisode: media.nextAiringEpisode || null,
        },
        include: {
          episodeList: {
            orderBy: { number: 'asc' },
          },
        },
      });

      // Sync streaming episodes if available (non-blocking)
      if (media.streamingEpisodes && media.streamingEpisodes.length > 0) {
        this.syncStreamingEpisodes(id, media.streamingEpisodes).catch((err) => {
          console.log('Failed to sync streaming episodes:', err.message);
        });
      }

      // Auto-create episodes from episode count if not present (non-blocking)
      if (media.episodes && (!anime.episodeList || anime.episodeList.length === 0)) {
        console.log(`Auto-creating ${media.episodes} episodes for anime ${id}`);
        this.createEpisodesFromCount(id, media.episodes).catch((err) => {
          console.log('Failed to auto-create episodes:', err.message);
        });
      }

      return this.transformAnimeForApi(anime);
    } catch (dbError) {
      console.log('Failed to cache anime in database:', dbError.message);

      // Return AniList data directly if database fails
      return {
        ...media,
        title: media.title,
        episodeList: [],
      };
    }
  }

  /**
   * Create placeholder episodes based on episode count
   */
  private async createEpisodesFromCount(animeId: number, episodeCount: number) {
    const episodesToCreate = [];

    for (let episodeNumber = 1; episodeNumber <= episodeCount; episodeNumber++) {
      episodesToCreate.push({
        animeId,
        number: episodeNumber,
        title: `Episode ${episodeNumber}`,
        isFiller: false,
        isManga: false,
      });
    }

    // Batch create episodes
    await this.prisma.episode.createMany({
      data: episodesToCreate,
      skipDuplicates: true,
    });

    console.log(`Created ${episodeCount} episodes for anime ${animeId}`);
  }

  async getTrending(page = 1, perPage = 10) {
    return this.anilistService.getTrending(page, perPage);
  }

  async getAiringSchedule(page = 1, perPage = 20) {
    return this.anilistService.getAiringSchedule(page, perPage, true);
  }

  private async syncStreamingEpisodes(animeId: number, streamingEpisodes: any[]) {
    // Parse episode numbers from titles (usually in format "Episode 1 - Title")
    for (const ep of streamingEpisodes) {
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
    }
  }

  private parseDate(dateObj: any): Date | null {
    if (!dateObj || !dateObj.year) return null;
    return new Date(
      dateObj.year,
      (dateObj.month || 1) - 1,
      dateObj.day || 1,
    );
  }

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

  private transformAnimeForApi(anime: any) {
    // Transform episodes to include episodeType
    const episodeList = anime.episodeList
      ? anime.episodeList.map((episode: any) => ({
          ...episode,
          episodeType: this.getEpisodeType(episode.isFiller, episode.isManga),
        }))
      : [];

    return {
      ...anime,
      title: {
        romaji: anime.titleRomaji || anime.title,
        english: anime.titleEnglish,
        native: anime.title,
      },
      coverImage: {
        large: anime.coverImage,
        medium: anime.coverImage,
      },
      episodeList,
    };
  }
}
