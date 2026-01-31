import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { AniListService } from '@/common/external-apis/anilist.service';

@Module({
  controllers: [AnimeController],
  providers: [AnimeService, AniListService],
  exports: [AnimeService],
})
export class AnimeModule {}
