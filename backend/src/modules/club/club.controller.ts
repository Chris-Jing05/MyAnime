import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClubService } from './club.service';
import { CreateClubDto, CreatePostDto } from './dto/create-club.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a club' })
  async create(@CurrentUser() user: any, @Body() createClubDto: CreateClubDto) {
    return this.clubService.create(user.id, createClubDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all clubs' })
  async findAll() {
    return this.clubService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get club by ID' })
  async findOne(@Param('id') id: string) {
    return this.clubService.findOne(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a club' })
  async join(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clubService.join(id, user.id);
  }

  @Post(':id/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a club post' })
  async createPost(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.clubService.createPost(id, user.id, createPostDto);
  }
}
