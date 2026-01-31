import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Lists')
@Controller('lists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  @ApiOperation({ summary: 'Add anime to list' })
  async create(@CurrentUser() user: any, @Body() createListDto: CreateListDto) {
    return this.listService.create(user.id, createListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user anime list' })
  async findAll(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.listService.findAllByUser(user.id, status);
  }

  @Get(':animeId')
  @ApiOperation({ summary: 'Get list entry for an anime' })
  async findOne(
    @CurrentUser() user: any,
    @Param('animeId', ParseIntPipe) animeId: number,
  ) {
    return this.listService.findOne(user.id, animeId);
  }

  @Put(':animeId')
  @ApiOperation({ summary: 'Update list entry' })
  async update(
    @CurrentUser() user: any,
    @Param('animeId', ParseIntPipe) animeId: number,
    @Body() updateListDto: UpdateListDto,
  ) {
    return this.listService.update(user.id, animeId, updateListDto);
  }

  @Delete(':animeId')
  @ApiOperation({ summary: 'Remove anime from list' })
  async remove(
    @CurrentUser() user: any,
    @Param('animeId', ParseIntPipe) animeId: number,
  ) {
    return this.listService.remove(user.id, animeId);
  }

  @Put(':animeId/progress')
  @ApiOperation({ summary: 'Update episode progress for an anime' })
  async updateProgress(
    @CurrentUser() user: any,
    @Param('animeId', ParseIntPipe) animeId: number,
    @Body('progress', ParseIntPipe) progress: number,
  ) {
    return this.listService.updateProgress(user.id, animeId, progress);
  }

  @Post(':animeId/increment-progress')
  @ApiOperation({ summary: 'Increment episode progress by 1' })
  async incrementProgress(
    @CurrentUser() user: any,
    @Param('animeId', ParseIntPipe) animeId: number,
  ) {
    return this.listService.incrementProgress(user.id, animeId);
  }
}
