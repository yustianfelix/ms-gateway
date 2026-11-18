import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { AttendanceActionDto } from './dto/attendance-action.dto';
import { AttendanceActionResponseDto } from './dto/attendance-action-response.dto';
import { AttendanceSummaryRequestBodyDto } from './dto/attendance-summary-request-body.dto';
import { AttendanceSummaryResponseDto } from './dto/attendance-summary-response.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async recordAction(
    @Body() attendanceActionDto: AttendanceActionDto,
    @Req() req: Request,
  ): Promise<AttendanceActionResponseDto> {
    return this.attendanceService.recordAction(attendanceActionDto, req.headers);
  }

  @Get('summary')
  async getSummary(
    @Query() query: Partial<AttendanceSummaryRequestBodyDto>,
    @Body() body: Partial<AttendanceSummaryRequestBodyDto>,
    @Req() req: Request,
  ): Promise<AttendanceSummaryResponseDto> {
    const employeeId = query.employee_id || body.employee_id;
    if (!employeeId) {
      throw new BadRequestException('employee_id is required');
    }

    const summaryDto: AttendanceSummaryRequestBodyDto = {
      employee_id: employeeId,
      start_date: query.start_date || body.start_date,
      end_date: query.end_date || body.end_date,
    };

    return this.attendanceService.getSummary(summaryDto, req.headers);
  }

  // Frontend helper endpoint: allows calling POST /attendance/summary if client environment blocks GET with body
  @Post('summary')
  async postSummary(
    @Body() body: AttendanceSummaryRequestBodyDto,
    @Req() req: Request,
  ): Promise<AttendanceSummaryResponseDto> {
    return this.attendanceService.getSummary(body, req.headers);
  }
}
