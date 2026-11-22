import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class AttendanceListQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  employee_id?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
