import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AnimeService } from '../anime/anime.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListService {
  constructor(
    private prisma: PrismaService,
    private animeService: AnimeService,
  ) {}

  async create(userId: string, createListDto: CreateListDto) {
    const { animeId, status, score, progress, notes, isFavorite } = createListDto;

    // Fetch and cache anime data from AniList if not already in database
    const anime = await this.animeService.findById(animeId);

    const list = await this.prisma.animeList.create({
      data: {
        userId,
        animeId,
        status,
        score,
        progress,
        notes,
        isFavorite,
        startedAt: status === 'WATCHING' ? new Date() : null,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        anime: true,
      },
    });

    // Create activity
    await this.prisma.activity.create({
      data: {
        userId,
        type: 'LIST_UPDATE',
        metadata: {
          animeId,
          status,
          animeTitle: anime.title?.romaji || anime.title?.english || anime.title?.native || 'Unknown',
        },
      },
    });

    return this.transformListForApi(list);
  }

  async findAllByUser(userId: string, status?: string) {
    const lists = await this.prisma.animeList.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      include: {
        anime: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return lists.map(list => this.transformListForApi(list));
  }

  async findOne(userId: string, animeId: number) {
    const list = await this.prisma.animeList.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      include: {
        anime: true,
      },
    });

    if (!list) {
      throw new NotFoundException('List entry not found');
    }

    return this.transformListForApi(list);
  }

  async update(userId: string, animeId: number, updateListDto: UpdateListDto) {
    const existingList = await this.prisma.animeList.findUnique({
      where: { userId_animeId: { userId, animeId } },
      include: { anime: true },
    });

    if (!existingList) {
      throw new NotFoundException('List entry not found');
    }

    const list = await this.prisma.animeList.update({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      data: {
        ...updateListDto,
        startedAt:
          updateListDto.status === 'WATCHING' && !existingList.startedAt
            ? new Date()
            : existingList.startedAt,
        completedAt:
          updateListDto.status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        anime: true,
      },
    });

    // Create activity if completed
    if (updateListDto.status === 'COMPLETED') {
      await this.prisma.activity.create({
        data: {
          userId,
          type: 'ANIME_COMPLETED',
          metadata: {
            animeId,
            animeTitle: list.anime.titleRomaji || list.anime.title,
            score: list.score,
          },
        },
      });
    }

    return this.transformListForApi(list);
  }

  async remove(userId: string, animeId: number) {
    await this.findOne(userId, animeId); // Check if exists

    return this.prisma.animeList.delete({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
    });
  }

  async updateProgress(userId: string, animeId: number, progress: number) {
    const existingList = await this.prisma.animeList.findUnique({
      where: { userId_animeId: { userId, animeId } },
      include: { anime: true },
    });

    if (!existingList) {
      throw new NotFoundException('List entry not found. Add the anime to your list first.');
    }

    const totalEpisodes = existingList.anime.episodes || 0;
    const validProgress = Math.max(0, Math.min(progress, totalEpisodes));

    // Auto-update status based on progress
    let newStatus = existingList.status;
    let completedAt = existingList.completedAt;

    if (validProgress === totalEpisodes && totalEpisodes > 0) {
      newStatus = 'COMPLETED';
      completedAt = new Date();

      // Create completion activity
      await this.prisma.activity.create({
        data: {
          userId,
          type: 'ANIME_COMPLETED',
          metadata: {
            animeId,
            animeTitle: existingList.anime.titleRomaji || existingList.anime.title,
            score: existingList.score,
          },
        },
      });
    } else if (validProgress > 0 && existingList.status === 'PLAN_TO_WATCH') {
      newStatus = 'WATCHING';
    }

    const list = await this.prisma.animeList.update({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      data: {
        progress: validProgress,
        status: newStatus,
        startedAt: existingList.startedAt || (validProgress > 0 ? new Date() : null),
        completedAt,
      },
      include: {
        anime: true,
      },
    });

    return this.transformListForApi(list);
  }

  async incrementProgress(userId: string, animeId: number) {
    const existingList = await this.prisma.animeList.findUnique({
      where: { userId_animeId: { userId, animeId } },
      include: { anime: true },
    });

    if (!existingList) {
      throw new NotFoundException('List entry not found. Add the anime to your list first.');
    }

    const newProgress = existingList.progress + 1;
    return this.updateProgress(userId, animeId, newProgress);
  }

  private transformListForApi(list: any) {
    if (!list.anime) return list;

    return {
      ...list,
      anime: {
        ...list.anime,
        title: {
          romaji: list.anime.titleRomaji || list.anime.title,
          english: list.anime.titleEnglish,
          native: list.anime.title,
        },
        coverImage: {
          large: list.anime.coverImage,
          medium: list.anime.coverImage,
        },
      },
    };
  }
}
