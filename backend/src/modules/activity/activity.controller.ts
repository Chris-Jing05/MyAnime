import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get activity feed' })
  async getActivityFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
  ) {
    return this.activityService.getActivityFeed(page, perPage);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activity' })
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
  ) {
    return this.activityService.getUserActivity(userId, page, perPage);
  }
}
