import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  async create(@CurrentUser() user: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(user.id, createReviewDto);
  }

  @Public()
  @Get('anime/:animeId')
  @ApiOperation({ summary: 'Get reviews for an anime' })
  async findByAnime(@Param('animeId', ParseIntPipe) animeId: number) {
    return this.reviewService.findByAnime(animeId);
  }

  @Post(':reviewId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on a review' })
  async vote(
    @CurrentUser() user: any,
    @Param('reviewId') reviewId: string,
    @Body('helpful') helpful: boolean,
  ) {
    return this.reviewService.voteReview(user.id, reviewId, helpful);
  }
}
