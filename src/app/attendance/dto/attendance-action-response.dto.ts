import type { Attendance } from '../entity/attendance.interface';

export interface AttendanceActionResponseDto {
  code: string;
  message: string;
  data: Attendance;
}
