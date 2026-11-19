import { Injectable } from '@nestjs/common';
import { sendUpstreamRequest } from '../../common/http-client';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private getBaseUrl(): string {
    return (
      process.env.AUTH_SERVICE_URL ?? 'http://localhost:3036'
    ).replace(/\/$/, '');
  }

  async login(
    credentials: LoginDto,
    incomingHeaders?: Record<string, string | string[] | undefined>,
  ): Promise<unknown> {
    const url = `${this.getBaseUrl()}/auth/login`;
    return sendUpstreamRequest({
      method: 'POST',
      url,
      body: credentials,
      headers: incomingHeaders,
      serviceName: 'Auth',
    });
  }
}
