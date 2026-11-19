import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { EmployeeController } from '../../../src/app/employee/employee.controller';
import { EmployeeService } from '../../../src/app/employee/employee.service';

describe('EmployeeController', () => {
  let controller: EmployeeController;

  const mockEmployeeService = {
    addEmployee: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addEmployee', () => {
    it('should forward request to employeeService', async () => {
      const dto = {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'securePassword123!',
      };
      const expectedResponse = {
        success: true,
        message: 'Employee created successfully',
      };

      mockEmployeeService.addEmployee.mockResolvedValue(expectedResponse);

      const mockReq = { headers: {} } as unknown as Request;
      const result = await controller.addEmployee(dto, mockReq);

      expect(mockEmployeeService.addEmployee).toHaveBeenCalledWith(dto, mockReq.headers);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('should forward employeeId to employeeService', async () => {
      const expectedResponse = {
        success: true,
        data: { employeeId: '10' },
      };

      mockEmployeeService.getProfile.mockResolvedValue(expectedResponse);

      const mockReq = { headers: {} } as unknown as Request;
      const result = await controller.getProfile('10', mockReq);

      expect(mockEmployeeService.getProfile).toHaveBeenCalledWith('10', mockReq.headers);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateProfile', () => {
    it('should forward update to employeeService', async () => {
      const updateDto = {
        currentPassword: 'currentPassword123!',
        phoneNumber: '08123456789',
      };
      const expectedResponse = {
        success: true,
        message: 'Employee profile updated successfully',
      };

      mockEmployeeService.updateProfile.mockResolvedValue(expectedResponse);

      const mockReq = { headers: {} } as unknown as Request;
      const result = await controller.updateProfile('10', updateDto, mockReq);

      expect(mockEmployeeService.updateProfile).toHaveBeenCalledWith('10', updateDto, mockReq.headers);
      expect(result).toEqual(expectedResponse);
    });
  });
});
