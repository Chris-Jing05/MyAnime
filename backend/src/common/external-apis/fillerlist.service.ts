import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RedisService } from '../redis/redis.service';

interface FillerEpisode {
  episodeNumber: number;
  isFiller: boolean;
  isManga: boolean;
}

@Injectable()
export class FillerListService {
  private readonly baseUrl = 'https://www.animefillerlist.com';
  private readonly CACHE_TTL = 2592000; // 30 days

  constructor(private redis: RedisService) {}

  /**
   * Get filler episodes for an anime by scraping animefillerlist.com
   * @param animeSlug - URL slug of the anime (e.g., "naruto", "one-piece")
   */
  async getFillerEpisodes(animeSlug: string): Promise<FillerEpisode[]> {
    const cacheKey = `fillerlist:${animeSlug.toLowerCase()}`;

    try {
      const cached = await this.redis.getJson<FillerEpisode[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (redisError) {
      console.warn('Redis error when fetching filler cache:', redisError);
    }

    try {
      // Scrape the animefillerlist.com page
      const url = `${this.baseUrl}/shows/${animeSlug.toLowerCase()}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MyAnimeBot/1.0)',
        },
      });

      const $ = cheerio.load(response.data);
      const episodes: FillerEpisode[] = [];

      // Parse the episode table
      $('.Episodes tr').each((_, element) => {
        const episodeText = $(element).find('td').first().text().trim();
        const episodeMatch = episodeText.match(/^(\d+)/);

        if (!episodeMatch) return;

        const episodeNumber = parseInt(episodeMatch[1]);
        const typeCell = $(element).find('td').eq(1);
        const typeClass = typeCell.attr('class') || '';

        // Determine episode type based on class
        const isFiller = typeClass.includes('filler') || typeClass.includes('Filler');
        const isManga = typeClass.includes('manga') || typeClass.includes('Manga');

        episodes.push({
          episodeNumber,
          isFiller,
          isManga,
        });
      });

      // Cache the results
      try {
        await this.redis.setJson(cacheKey, episodes, this.CACHE_TTL);
      } catch (redisError) {
        console.warn('Redis error when caching filler data:', redisError);
      }

      return episodes;
    } catch (error) {
      console.warn(`Filler data not available for ${animeSlug}:`, error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async isFillerEpisode(
    animeSlug: string,
    episodeNumber: number,
  ): Promise<boolean> {
    const episodes = await this.getFillerEpisodes(animeSlug);
    const episode = episodes.find((ep) => ep.episodeNumber === episodeNumber);
    return episode?.isFiller || false;
  }

  /**
   * Get suggested anime slug from anime title
   * This is a helper to convert titles to URL slugs
   */
  getSuggestedSlug(animeTitle: string): string {
    return animeTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
