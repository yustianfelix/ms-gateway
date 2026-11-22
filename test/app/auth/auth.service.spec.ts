import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/app/auth/auth.service';
import * as httpClient from '../../../src/common/http-client';

jest.mock('../../../src/common/http-client');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-signed-jwt-token'),
    };
    service = new AuthService(jwtService as JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should forward credentials upstream and return response with signed access_token', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const upstreamResponse = {
        success: true,
        message: 'Login successful',
        data: {
          employeeId: '1',
          name: 'John Doe',
          email: 'test@example.com',
          photo: null,
          role: 'employee',
          phoneNumber: null,
        },
      };

      (httpClient.sendUpstreamRequest as jest.Mock).mockResolvedValue(
        upstreamResponse,
      );

      const result = (await service.login(credentials, { 'user-agent': 'jest' })) as {
        access_token: string;
        data: { access_token: string; email: string };
      };

      expect(httpClient.sendUpstreamRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: expect.stringContaining('/auth/login'),
        body: credentials,
        headers: { 'user-agent': 'jest' },
        serviceName: 'Auth',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: '1',
          email: 'test@example.com',
          role: 'employee',
          name: 'John Doe',
        },
        expect.objectContaining({
          secret: expect.any(String),
        }),
      );
      expect(result.access_token).toBe('mock-signed-jwt-token');
      expect(result.data.access_token).toBe('mock-signed-jwt-token');
    });
  });
});
