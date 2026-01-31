import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
// import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AnimeModule } from './modules/anime/anime.module';
import { EpisodeModule } from './modules/episode/episode.module';
import { ListModule } from './modules/list/list.module';
import { ReviewModule } from './modules/review/review.module';
import { ClubModule } from './modules/club/club.module';
import { ActivityModule } from './modules/activity/activity.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT) || 10,
      },
    ]),
    // ScheduleModule.forRoot(), // Temporarily disabled - dependency issue
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    AnimeModule,
    EpisodeModule,
    ListModule,
    ReviewModule,
    ClubModule,
    ActivityModule,
    RecommendationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
