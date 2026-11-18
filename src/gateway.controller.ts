import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class GatewayController {
  constructor(private readonly appService: AppService) {}

  @All('auth')
  proxyAuthRoot(@Req() request: Request, @Res() response: Response) {
    return this.appService.proxy(request, response, 'auth');
  }

  @All('auth/{*path}')
  proxyAuth(@Req() request: Request, @Res() response: Response) {
    return this.appService.proxy(request, response, 'auth');
  }

  @All('attendance')
  proxyAttendanceRoot(@Req() request: Request, @Res() response: Response) {
    return this.appService.proxy(request, response, 'attendance');
  }

  @All('attendance/{*path}')
  proxyAttendance(@Req() request: Request, @Res() response: Response) {
    return this.appService.proxy(request, response, 'attendance');
  }
}
