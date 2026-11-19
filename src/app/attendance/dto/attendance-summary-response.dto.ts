import type { Attendance } from '../entity/attendance.interface';

export interface AttendanceSummaryResponseDto {
  code: string;
  message: string;
  data: {
    employee_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    attendances: Attendance[];
  };
}
