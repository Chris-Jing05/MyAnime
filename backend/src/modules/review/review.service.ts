import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const existing = await this.prisma.review.findUnique({
      where: { userId_animeId: { userId, animeId: createReviewDto.animeId } },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this anime');
    }

    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        anime: { select: { id: true, title: true } },
      },
    });

    await this.prisma.activity.create({
      data: {
        userId,
        type: 'REVIEW_POSTED',
        metadata: {
          reviewId: review.id,
          animeId: review.animeId,
          animeTitle: review.anime.title,
        },
      },
    });

    return review;
  }

  async findByAnime(animeId: number) {
    return this.prisma.review.findMany({
      where: { animeId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { helpfulCount: 'desc' },
    });
  }

  async voteReview(userId: string, reviewId: string, helpful: boolean) {
    await this.prisma.reviewVote.upsert({
      where: { userId_reviewId: { userId, reviewId } },
      update: { helpful },
      create: { userId, reviewId, helpful },
    });

    const helpfulCount = await this.prisma.reviewVote.count({
      where: { reviewId, helpful: true },
    });

    await this.prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount },
    });
  }
}
