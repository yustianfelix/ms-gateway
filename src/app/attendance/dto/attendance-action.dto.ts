import { IsDateString, IsEnum, IsString, Matches } from 'class-validator';

export enum AttendanceAction {
  ClockIn = 'clock-in',
  ClockOut = 'clock-out',
}

export class AttendanceActionDto {
  @IsString()
  @Matches(/^\d+$/)
  employee_id: string;

  @IsEnum(AttendanceAction)
  action: AttendanceAction;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;
}
