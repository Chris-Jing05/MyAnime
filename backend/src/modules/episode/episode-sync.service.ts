import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { EpisodeService } from './episode.service';
import { FillerListService } from '@/common/external-apis/fillerlist.service';

@Injectable()
export class EpisodeSyncService {
  private readonly logger = new Logger(EpisodeSyncService.name);

  constructor(
    private prisma: PrismaService,
    private episodeService: EpisodeService,
    private fillerListService: FillerListService,
  ) {}

  /**
   * Scheduled task that runs every hour to sync episodes for currently airing anime
   * Cron format: minute hour day month dayOfWeek
   * '0 * * * *' = every hour at the 0th minute
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncAiringAnimeEpisodes() {
    this.logger.log('Starting scheduled sync of airing anime episodes...');

    try {
      // Find all anime that are currently airing
      const airingAnime = await this.prisma.anime.findMany({
        where: {
          status: 'RELEASING',
        },
        select: {
          id: true,
          title: true,
          titleEnglish: true,
          titleRomaji: true,
        },
      });

      this.logger.log(`Found ${airingAnime.length} airing anime to sync`);

      let successCount = 0;
      let errorCount = 0;

      // Sync episodes for each airing anime
      for (const anime of airingAnime) {
        try {
          this.logger.log(`Syncing episodes for anime ${anime.id}: ${anime.title || anime.titleEnglish}`);

          // Sync episode data from AniList
          const anilistResult = await this.episodeService.syncEpisodesFromAniList(anime.id);
          this.logger.log(`AniList sync for ${anime.id}: ${anilistResult.message}`);

          // Attempt to sync filler data
          // Use titleEnglish or titleRomaji to generate slug
          const animeTitle = anime.titleEnglish || anime.titleRomaji || anime.title;
          if (animeTitle) {
            const suggestedSlug = this.fillerListService.getSuggestedSlug(animeTitle);

            try {
              const fillerResult = await this.episodeService.syncFillerData(anime.id, suggestedSlug);
              if (fillerResult.synced > 0) {
                this.logger.log(`Filler sync for ${anime.id}: ${fillerResult.message}`);
              }
            } catch (fillerError) {
              // Filler data might not be available for all anime, so just log warning
              this.logger.warn(`Could not sync filler data for ${anime.id} (${suggestedSlug}): ${fillerError.message}`);
            }
          }

          successCount++;
        } catch (error) {
          errorCount++;
          this.logger.error(`Error syncing anime ${anime.id}: ${error.message}`, error.stack);
        }
      }

      this.logger.log(
        `Scheduled sync completed: ${successCount} successful, ${errorCount} errors out of ${airingAnime.length} anime`,
      );
    } catch (error) {
      this.logger.error(`Fatal error during scheduled sync: ${error.message}`, error.stack);
    }
  }

  /**
   * Manual trigger for testing - can be called via API endpoint if needed
   */
  async triggerManualSync() {
    this.logger.log('Manual sync triggered');
    return this.syncAiringAnimeEpisodes();
  }
}
