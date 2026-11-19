import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthController } from '../../../src/app/auth/auth.controller';
import { AuthService } from '../../../src/app/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should forward credentials and headers to authService', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
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

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const mockReq = { headers: { 'user-agent': 'jest' } } as unknown as Request;
      const result = await controller.login(credentials, mockReq);

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials, mockReq.headers);
      expect(result).toEqual(expectedResponse);
    });
  });
});
