import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EpisodeService } from './episode.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Public()
  @Get('anime/:animeId')
  @ApiOperation({ summary: 'Get all episodes for an anime' })
  @ApiParam({ name: 'animeId', description: 'AniList anime ID' })
  async getEpisodesByAnime(@Param('animeId', ParseIntPipe) animeId: number) {
    return this.episodeService.getEpisodesByAnime(animeId);
  }

  @Public()
  @Get('anime/:animeId/:episodeNumber')
  @ApiOperation({ summary: 'Get specific episode details' })
  @ApiParam({ name: 'animeId', description: 'AniList anime ID' })
  @ApiParam({ name: 'episodeNumber', description: 'Episode number' })
  async getEpisodeByNumber(
    @Param('animeId', ParseIntPipe) animeId: number,
    @Param('episodeNumber', ParseIntPipe) episodeNumber: number,
  ) {
    return this.episodeService.getEpisodeByNumber(animeId, episodeNumber);
  }

  @Public()
  @Get('anime/:animeId/next')
  @ApiOperation({ summary: 'Get next airing episode for an anime' })
  @ApiParam({ name: 'animeId', description: 'AniList anime ID' })
  async getNextAiringEpisode(@Param('animeId', ParseIntPipe) animeId: number) {
    return this.episodeService.getNextAiringEpisode(animeId);
  }

  @Public()
  @Get('airing')
  @ApiOperation({ summary: 'Get airing schedule for upcoming episodes' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page' })
  async getAiringSchedule(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
  ) {
    return this.episodeService.getAiringSchedule(page, perPage);
  }

  @Public()
  @Post('anime/:animeId/sync')
  @ApiOperation({ summary: 'Sync episode data from AniList' })
  @ApiParam({ name: 'animeId', description: 'AniList anime ID' })
  async syncEpisodes(@Param('animeId', ParseIntPipe) animeId: number) {
    return this.episodeService.syncEpisodesFromAniList(animeId);
  }

  @Public()
  @Post('anime/:animeId/sync-fillers')
  @ApiOperation({ summary: 'Sync filler data from AnimeFillerList.com' })
  @ApiParam({ name: 'animeId', description: 'AniList anime ID' })
  async syncFillers(
    @Param('animeId', ParseIntPipe) animeId: number,
    @Body('animeSlug') animeSlug: string,
  ) {
    if (!animeSlug) {
      return { error: 'animeSlug is required in request body' };
    }
    return this.episodeService.syncFillerData(animeId, animeSlug);
  }
}
