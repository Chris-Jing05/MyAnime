import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateClubDto, CreatePostDto } from './dto/create-club.dto';

@Injectable()
export class ClubService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createClubDto: CreateClubDto) {
    const club = await this.prisma.club.create({
      data: createClubDto,
    });

    // Add creator as owner
    await this.prisma.clubMember.create({
      data: {
        clubId: club.id,
        userId,
        role: 'OWNER',
      },
    });

    return club;
  }

  async findAll() {
    return this.prisma.club.findMany({
      where: { isPublic: true },
      include: {
        _count: {
          select: { members: true, posts: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        posts: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  async join(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');

    await this.prisma.clubMember.create({
      data: { clubId, userId, role: 'MEMBER' },
    });

    await this.prisma.activity.create({
      data: {
        userId,
        type: 'CLUB_JOINED',
        metadata: { clubId, clubName: club.name },
      },
    });
  }

  async createPost(clubId: string, userId: string, createPostDto: CreatePostDto) {
    const membership = await this.prisma.clubMember.findUnique({
      where: { clubId_userId: { clubId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to post');
    }

    const post = await this.prisma.clubPost.create({
      data: {
        ...createPostDto,
        clubId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        club: { select: { id: true, name: true } },
      },
    });

    await this.prisma.activity.create({
      data: {
        userId,
        type: 'CLUB_POST',
        metadata: {
          clubId,
          postId: post.id,
          clubName: post.club.name,
        },
      },
    });

    return post;
  }
}
