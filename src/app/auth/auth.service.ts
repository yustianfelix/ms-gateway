import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { sendUpstreamRequest } from '../../common/http-client';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
    const response = await sendUpstreamRequest<Record<string, unknown>>({
      method: 'POST',
      url,
      body: credentials,
      headers: incomingHeaders,
      serviceName: 'Auth',
    });

    const responseData =
      response && typeof response === 'object' && 'data' in response
        ? (response.data as Record<string, unknown>)
        : (response as Record<string, unknown> | null);

    const payload = {
      sub: responseData?.employeeId ?? credentials.email,
      email: responseData?.email ?? credentials.email,
      role: responseData?.role ?? 'employee',
      name: responseData?.name,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? 'defaultSecretKey',
    });

    if (response && typeof response === 'object') {
      return {
        ...response,
        access_token: token,
        ...(response.data && typeof response.data === 'object'
          ? {
              data: {
                ...(response.data as Record<string, unknown>),
                access_token: token,
              },
            }
          : {}),
      };
    }

    return {
      access_token: token,
      data: response,
    };
  }
}
