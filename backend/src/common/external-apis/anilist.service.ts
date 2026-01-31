import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GraphQLClient, gql } from 'graphql-request';
import { RedisService } from '../redis/redis.service';

interface SearchAnimeParams {
  search?: string;
  page?: number;
  perPage?: number;
  season?: string;
  seasonYear?: number;
  genre?: string;
  status?: string;
}

@Injectable()
export class AniListService {
  private client: GraphQLClient;
  private readonly CACHE_TTL = 86400; // 24 hours

  constructor(private redis: RedisService) {
    this.client = new GraphQLClient(
      process.env.ANILIST_API_URL || 'https://graphql.anilist.co',
    );
  }

  async searchAnime(params: SearchAnimeParams) {
    const cacheKey = `anilist:search:${JSON.stringify(params)}`;

    try {
      const cached = await this.redis.getJson(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (redisError) {
      console.warn('Redis error when fetching search cache:', redisError);
      // Continue without cache if Redis fails
    }

    const query = gql`
      query (
        $page: Int
        $perPage: Int
        $search: String
        $season: MediaSeason
        $seasonYear: Int
        $genre: String
        $status: MediaStatus
      ) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          media(
            search: $search
            season: $season
            seasonYear: $seasonYear
            genre: $genre
            status: $status
            type: ANIME
            sort: POPULARITY_DESC
          ) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            bannerImage
            genres
            tags {
              name
            }
            averageScore
            popularity
            episodes
            status
            season
            seasonYear
            format
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            studios(isMain: true) {
              nodes {
                name
              }
            }
            externalLinks {
              url
              site
            }
          }
        }
      }
    `;

    try {
      const data: any = await this.client.request(query, {
        page: params.page || 1,
        perPage: params.perPage || 20,
        search: params.search,
        season: params.season,
        seasonYear: params.seasonYear,
        genre: params.genre,
        status: params.status,
      });

      // Try to cache, but don't fail if Redis is down
      try {
        await this.redis.setJson(cacheKey, data, this.CACHE_TTL);
      } catch (redisError) {
        console.warn('Redis error when caching search data:', redisError);
      }

      return data;
    } catch (error) {
      console.error('AniList API Error (searchAnime):', error);
      throw new HttpException(
        'Failed to fetch data from AniList',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getAnimeById(id: number) {
    const cacheKey = `anilist:anime:${id}`;

    try {
      const cached = await this.redis.getJson(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (redisError) {
      console.warn('Redis error when fetching anime cache:', redisError);
      // Continue without cache if Redis fails
    }

    const query = gql`
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
            medium
          }
          bannerImage
          genres
          tags {
            name
          }
          averageScore
          popularity
          episodes
          status
          season
          seasonYear
          format
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          studios(isMain: true) {
            nodes {
              name
            }
          }
          externalLinks {
            url
            site
          }
          streamingEpisodes {
            title
            thumbnail
            url
          }
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
    `;

    try {
      const data: any = await this.client.request(query, { id });

      // Try to cache, but don't fail if Redis is down
      try {
        await this.redis.setJson(cacheKey, data, this.CACHE_TTL);
      } catch (redisError) {
        console.warn('Redis error when caching anime data:', redisError);
      }

      return data;
    } catch (error) {
      console.error('AniList API Error (getAnimeById):', error);
      throw new HttpException(
        'Failed to fetch anime from AniList',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getAiringSchedule(page = 1, perPage = 20, notYetAired = true) {
    const cacheKey = `anilist:airing:${page}:${perPage}:${notYetAired}`;

    try {
      const cached = await this.redis.getJson(cacheKey);
      if (cached) {
        console.log('Returning cached airing schedule');
        return cached;
      }
    } catch (redisError) {
      console.warn('Redis error when fetching airing cache:', redisError);
    }

    const query = gql`
      query ($page: Int, $perPage: Int, $notYetAired: Boolean) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
          }
          airingSchedules(notYetAired: $notYetAired, sort: TIME) {
            id
            airingAt
            timeUntilAiring
            episode
            media {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
                medium
              }
              bannerImage
              genres
              averageScore
              popularity
            }
          }
        }
      }
    `;

    try {
      const data: any = await this.client.request(query, { page, perPage, notYetAired });

      // Cache for 1 hour
      try {
        await this.redis.setJson(cacheKey, data, 3600);
      } catch (redisError) {
        console.warn('Redis error when caching airing schedule:', redisError);
      }

      return data;
    } catch (error) {
      console.error('AniList API Error (getAiringSchedule):', error);
      throw new HttpException(
        {
          message: 'Failed to fetch airing schedule',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getTrending(page = 1, perPage = 10) {
    const cacheKey = `anilist:trending:${page}:${perPage}`;

    try {
      const cached = await this.redis.getJson(cacheKey);
      if (cached) {
        console.log('Returning cached trending data');
        return cached;
      }
    } catch (redisError) {
      console.warn('Redis error when fetching trending cache:', redisError);
      // Continue without cache if Redis fails
    }

    const query = gql`
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              medium
            }
            averageScore
            popularity
            genres
            status
            episodes
            format
          }
        }
      }
    `;

    try {
      const data: any = await this.client.request(query, { page, perPage });

      // Try to cache, but don't fail if Redis is down
      try {
        await this.redis.setJson(cacheKey, data, 3600); // 1 hour for trending
      } catch (redisError) {
        console.warn('Redis error when caching trending data:', redisError);
        // Continue without caching if Redis fails
      }

      return data;
    } catch (error) {
      console.error('AniList API Error (getTrending):', error);
      throw new HttpException(
        {
          message: 'Failed to fetch trending anime',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
