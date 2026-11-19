import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class AttendanceSummaryRequestBodyDto {
  @IsString()
  @Matches(/^\d+$/)
  employee_id: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  start_date?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  end_date?: string;
}

export type AttendanceSummaryDto = AttendanceSummaryRequestBodyDto;
