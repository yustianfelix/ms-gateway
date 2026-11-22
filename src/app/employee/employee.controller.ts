import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { EmployeeListRequestDto } from './dto/employee-list-request.dto';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  getEmployeeList(
    @Query() query: EmployeeListRequestDto,
    @Req() req: Request,
  ) {
    return this.employeeService.getEmployeeList(query, req.headers);
  }

  @Post()
  addEmployee(@Body() employee: CreateEmployeeDto, @Req() req: Request) {
    return this.employeeService.addEmployee(employee, req.headers);
  }

  @Get(':employeeId/profile')
  getProfile(@Param('employeeId') employeeId: string, @Req() req: Request) {
    return this.employeeService.getProfile(employeeId, req.headers);
  }

  @Patch(':employeeId/profile')
  updateProfile(
    @Param('employeeId') employeeId: string,
    @Body() update: UpdateEmployeeProfileDto,
    @Req() req: Request,
  ) {
    return this.employeeService.updateProfile(employeeId, update, req.headers);
  }
}
