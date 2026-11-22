import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthGuard } from '../../../src/app/auth/guard/auth.guard';
import { IS_PUBLIC_KEY } from '../../../src/app/auth/guard/public.decorator';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let reflector: jest.Mocked<Partial<Reflector>>;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    reflector = {
      getAllAndOverride: jest.fn(),
    };

    guard = new AuthGuard(
      jwtService as JwtService,
      reflector as Reflector,
    );
  });

  const createMockContext = (headers: Record<string, string | undefined>): ExecutionContext => {
    const mockRequest = {
      headers,
    } as unknown as Request;

    return {
      getHandler: jest.fn().mockReturnValue(() => {}),
      getClass: jest.fn().mockReturnValue(class MockController {}),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if route is marked with @Public()', async () => {
    reflector.getAllAndOverride!.mockReturnValue(true);
    const context = createMockContext({});

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      expect.anything(),
      expect.anything(),
    ]);
  });

  it('should throw UnauthorizedException if no authorization header is provided', async () => {
    reflector.getAllAndOverride!.mockReturnValue(false);
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if authorization format is not Bearer token', async () => {
    reflector.getAllAndOverride!.mockReturnValue(false);
    const context = createMockContext({ authorization: 'Basic 123456' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    reflector.getAllAndOverride!.mockReturnValue(false);
    jwtService.verifyAsync!.mockRejectedValue(new Error('Invalid token'));
    const context = createMockContext({ authorization: 'Bearer invalid.token' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should allow access and attach user payload when token is valid', async () => {
    const payload = { sub: '1', email: 'user@example.com', role: 'employee' };
    reflector.getAllAndOverride!.mockReturnValue(false);
    jwtService.verifyAsync!.mockResolvedValue(payload);

    const mockRequest = {
      headers: { authorization: 'Bearer valid.jwt.token' },
    } as unknown as Request & { user?: Record<string, unknown> };

    const context = {
      getHandler: jest.fn().mockReturnValue(() => {}),
      getClass: jest.fn().mockReturnValue(class MockController {}),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(payload);
  });
});
