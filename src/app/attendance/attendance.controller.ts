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
import { AttendanceListQueryDto } from './dto/attendance-list-query.dto';
import { AttendanceListResponseDto } from './dto/attendance-list-response.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async getList(
    @Query() query: AttendanceListQueryDto,
    @Req() req: Request,
  ): Promise<AttendanceListResponseDto> {
    return this.attendanceService.getList(query, req.headers);
  }

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
    @Req() req: Request,
  ): Promise<AttendanceSummaryResponseDto> {
    const employeeId = query.employee_id ;
    if (!employeeId) {
      throw new BadRequestException('employee_id is required');
    }

    const summaryDto: AttendanceSummaryRequestBodyDto = {
      employee_id: employeeId,
      start_date: query.start_date,
      end_date: query.end_date,
    };

    return this.attendanceService.getSummary(summaryDto, req.headers);
  }
}
