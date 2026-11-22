import type { Attendance } from '../entity/attendance.interface';

export interface AttendanceListResponseDto {
  code: string;
  message: string;
  data: {
    attendances: Attendance[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}
