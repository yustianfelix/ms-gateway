import { Injectable } from '@nestjs/common';
import { sendUpstreamRequest } from '../../common/http-client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { EmployeeListRequestDto } from './dto/employee-list-request.dto';

@Injectable()
export class EmployeeService {
  private getBaseUrl(): string {
    return (
      process.env.AUTH_SERVICE_URL ?? 'http://localhost:3036'
    ).replace(/\/$/, '');
  }

  async getEmployeeList(
    query: EmployeeListRequestDto = {},
    incomingHeaders?: Record<string, string | string[] | undefined>,
  ): Promise<unknown> {
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined) queryParams.append(key, String(item));
        }
      } else if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    }

    const queryString = queryParams.toString();
    const url = `${this.getBaseUrl()}/employees${queryString ? `?${queryString}` : ''}`;

    return sendUpstreamRequest({
      method: 'GET',
      url,
      headers: incomingHeaders,
      serviceName: 'Auth (Employees)',
    });
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
