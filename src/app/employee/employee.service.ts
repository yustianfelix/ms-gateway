import { Injectable } from '@nestjs/common';
import { sendUpstreamRequest } from '../../common/http-client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';

@Injectable()
export class EmployeeService {
  private getBaseUrl(): string {
    return (
      process.env.AUTH_SERVICE_URL ?? 'http://localhost:3036'
    ).replace(/\/$/, '');
  }

  async addEmployee(
    employee: CreateEmployeeDto,
    incomingHeaders?: Record<string, string | string[] | undefined>,
  ): Promise<unknown> {
    const url = `${this.getBaseUrl()}/employees`;
    return sendUpstreamRequest({
      method: 'POST',
      url,
      body: employee,
      headers: incomingHeaders,
      serviceName: 'Auth (Employees)',
    });
  }

  async getProfile(
    employeeId: string,
    incomingHeaders?: Record<string, string | string[] | undefined>,
  ): Promise<unknown> {
    const url = `${this.getBaseUrl()}/employees/${encodeURIComponent(employeeId)}/profile`;
    return sendUpstreamRequest({
      method: 'GET',
      url,
      headers: incomingHeaders,
      serviceName: 'Auth (Employees)',
    });
  }

  async updateProfile(
    employeeId: string,
    update: UpdateEmployeeProfileDto,
    incomingHeaders?: Record<string, string | string[] | undefined>,
  ): Promise<unknown> {
    const url = `${this.getBaseUrl()}/employees/${encodeURIComponent(employeeId)}/profile`;
    return sendUpstreamRequest({
      method: 'PATCH',
      url,
      body: update,
      headers: incomingHeaders,
      serviceName: 'Auth (Employees)',
    });
  }
}
