import { IsInt, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsInt()
  animeId: number;

  @ApiProperty({ minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  spoilers: boolean = false;
}
