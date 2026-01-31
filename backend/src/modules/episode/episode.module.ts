import { Module } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { EpisodeController } from './episode.controller';
// import { EpisodeSyncService } from './episode-sync.service'; // Temporarily disabled - ScheduleModule dependency issue
import { FillerListService } from '@/common/external-apis/fillerlist.service';
import { AniListService } from '@/common/external-apis/anilist.service';

@Module({
  controllers: [EpisodeController],
  providers: [EpisodeService, FillerListService, AniListService],
  exports: [EpisodeService],
})
export class EpisodeModule {}
