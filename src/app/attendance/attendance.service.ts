import { Injectable } from '@nestjs/common';
import { sendUpstreamRequest } from '../../common/http-client';
import { AttendanceActionDto } from './dto/attendance-action.dto';
import { AttendanceActionResponseDto } from './dto/attendance-action-response.dto';
import { AttendanceSummaryRequestBodyDto } from './dto/attendance-summary-request-body.dto';
import { AttendanceSummaryResponseDto } from './dto/attendance-summary-response.dto';

@Injectable()
export class AttendanceService {
  private getBaseUrl(): string {
    return (
      process.env.ATTENDANCE_SERVICE_URL ?? 'http://localhost:3035'
    ).replace(/\/$/, '');
  }

  async recordAction(
    dto: AttendanceActionDto,
    incomingHeaders?: Record<string, string | string[] | undefined>,
  ): Promise<AttendanceActionResponseDto> {
    const url = `${this.getBaseUrl()}/attendance`;
    return sendUpstreamRequest<AttendanceActionResponseDto>({
      method: 'POST',
      url,
      body: dto,
      headers: incomingHeaders,
      serviceName: 'Attendance',
    });
  }

  async getSummary(
    dto: AttendanceSummaryRequestBodyDto,
    incomingHeaders?: Record<string, string | string[] | undefined>,
  ): Promise<AttendanceSummaryResponseDto> {
    const queryParams = new URLSearchParams();
    if (dto.employee_id) queryParams.set('employee_id', dto.employee_id);
    if (dto.start_date) queryParams.set('start_date', dto.start_date);
    if (dto.end_date) queryParams.set('end_date', dto.end_date);

    const queryString = queryParams.toString();
    const url = `${this.getBaseUrl()}/attendance/summary${queryString ? `?${queryString}` : ''}`;

    // ms-attendance accepts the summary payload in the request body
    return sendUpstreamRequest<AttendanceSummaryResponseDto>({
      method: 'GET',
      url,
      body: dto,
      headers: incomingHeaders,
      serviceName: 'Attendance',
    });
  }
}
