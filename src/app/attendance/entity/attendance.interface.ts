export interface Attendance {
  uuid: string;
  employeeId: string;
  date: string;
  status: string;
  clockIn: Date | string;
  clockOut: Date | string | null;
}
