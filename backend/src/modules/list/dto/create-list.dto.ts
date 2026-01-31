import { IsInt, IsEnum, IsOptional, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ListStatus {
  WATCHING = 'WATCHING',
  COMPLETED = 'COMPLETED',
  PLAN_TO_WATCH = 'PLAN_TO_WATCH',
  DROPPED = 'DROPPED',
  ON_HOLD = 'ON_HOLD',
}

export class CreateListDto {
  @ApiProperty()
  @IsInt()
  animeId: number;

  @ApiProperty({ enum: ListStatus })
  @IsEnum(ListStatus)
  status: ListStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  progress?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
