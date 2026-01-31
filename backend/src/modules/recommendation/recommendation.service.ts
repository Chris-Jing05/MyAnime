import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';

interface UserAnimeRating {
  userId: string;
  animeId: number;
  rating: number;
}

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getRecommendations(userId: string, limit = 10) {
    // Check cache first
    const cacheKey = `recommendations:${userId}`;
    const cached = await this.redis.getJson<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // Get user ratings
    const userRatings = await this.getUserRatings(userId);

    if (userRatings.length === 0) {
      // Return trending if user has no ratings
      return this.getPopularAnime(limit);
    }

    // Find similar users using collaborative filtering
    const recommendations = await this.collaborativeFiltering(
      userId,
      userRatings,
      limit,
    );

    // Cache for 1 hour
    await this.redis.setJson(cacheKey, recommendations, 3600);

    return recommendations;
  }

  private async getUserRatings(userId: string): Promise<UserAnimeRating[]> {
    // Get explicit ratings from AnimeList
    const lists = await this.prisma.animeList.findMany({
      where: { userId, score: { not: null } },
      select: { userId: true, animeId: true, score: true },
    });

    return lists.map((list) => ({
      userId: list.userId,
      animeId: list.animeId,
      rating: list.score,
    }));
  }

  private async collaborativeFiltering(
    userId: string,
    userRatings: UserAnimeRating[],
    limit: number,
  ) {
    // Get anime IDs the user has rated
    const ratedAnimeIds = userRatings.map((r) => r.animeId);

    // Find users who have rated similar anime
    const similarUserRatings = await this.prisma.animeList.findMany({
      where: {
        animeId: { in: ratedAnimeIds },
        userId: { not: userId },
        score: { not: null },
      },
      select: { userId: true, animeId: true, score: true },
    });

    // Calculate user similarity using cosine similarity
    const userSimilarities = this.calculateUserSimilarities(
      userRatings,
      similarUserRatings,
    );

    // Get top similar users
    const topSimilarUsers = userSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map((u) => u.userId);

    // Get anime rated by similar users that current user hasn't rated
    const recommendedAnime = await this.prisma.animeList.findMany({
      where: {
        userId: { in: topSimilarUsers },
        animeId: { notIn: ratedAnimeIds },
        score: { gte: 7 }, // Only recommend highly rated anime
      },
      include: { anime: true },
      distinct: ['animeId'],
      take: limit * 2,
    });

    // Calculate weighted scores
    const scoredRecommendations = recommendedAnime
      .map((item) => {
        const similarity = userSimilarities.find(
          (u) => u.userId === item.userId,
        )?.similarity || 0;
        const weightedScore = (item.score || 0) * similarity;
        return {
          anime: item.anime,
          predictedScore: weightedScore,
        };
      })
      .sort((a, b) => b.predictedScore - a.predictedScore)
      .slice(0, limit);

    return scoredRecommendations.map((r) => this.transformAnimeForApi(r.anime));
  }

  private calculateUserSimilarities(
    userRatings: UserAnimeRating[],
    otherRatings: any[],
  ): { userId: string; similarity: number }[] {
    const userRatingMap = new Map(
      userRatings.map((r) => [r.animeId, r.rating]),
    );

    // Group by user
    const userGroups = new Map<string, any[]>();
    otherRatings.forEach((rating) => {
      if (!userGroups.has(rating.userId)) {
        userGroups.set(rating.userId, []);
      }
      userGroups.get(rating.userId).push(rating);
    });

    // Calculate cosine similarity for each user
    const similarities: { userId: string; similarity: number }[] = [];

    userGroups.forEach((ratings, otherUserId) => {
      let dotProduct = 0;
      let userMagnitude = 0;
      let otherMagnitude = 0;

      ratings.forEach((rating) => {
        const userRating = userRatingMap.get(rating.animeId);
        if (userRating !== undefined) {
          dotProduct += userRating * rating.score;
          userMagnitude += userRating ** 2;
          otherMagnitude += rating.score ** 2;
        }
      });

      const magnitude = Math.sqrt(userMagnitude) * Math.sqrt(otherMagnitude);
      const similarity = magnitude > 0 ? dotProduct / magnitude : 0;

      if (similarity > 0) {
        similarities.push({ userId: otherUserId, similarity });
      }
    });

    return similarities;
  }

  private async getPopularAnime(limit: number) {
    const anime = await this.prisma.anime.findMany({
      orderBy: { popularity: 'desc' },
      take: limit,
    });

    return anime.map((a) => this.transformAnimeForApi(a));
  }

  async invalidateCache(userId: string) {
    await this.redis.del(`recommendations:${userId}`);
  }

  private transformAnimeForApi(anime: any) {
    if (!anime) return anime;

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
    };
  }
}
