import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            animeLists: true,
            reviews: true,
            clubMemberships: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getStats(userId: string) {
    const [watching, completed, planToWatch, dropped] = await Promise.all([
      this.prisma.animeList.count({
        where: { userId, status: 'WATCHING' },
      }),
      this.prisma.animeList.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.animeList.count({
        where: { userId, status: 'PLAN_TO_WATCH' },
      }),
      this.prisma.animeList.count({
        where: { userId, status: 'DROPPED' },
      }),
    ]);

    const totalEpisodesWatched = await this.prisma.animeList.aggregate({
      where: { userId },
      _sum: { progress: true },
    });

    return {
      watching,
      completed,
      planToWatch,
      dropped,
      totalEpisodesWatched: totalEpisodesWatched._sum.progress || 0,
    };
  }
}
