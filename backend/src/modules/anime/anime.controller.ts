import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnimeService } from './anime.service';
import { SearchAnimeDto } from './dto/search-anime.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Anime')
@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search anime' })
  async search(@Query() searchDto: SearchAnimeDto) {
    return this.animeService.search(searchDto);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending anime' })
  async getTrending(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
  ) {
    return this.animeService.getTrending(page, perPage);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get anime by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.findById(id);
  }
}
