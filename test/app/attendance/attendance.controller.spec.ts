import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AttendanceController } from '../../../src/app/attendance/attendance.controller';
import { AttendanceService } from '../../../src/app/attendance/attendance.service';
import { AttendanceAction } from '../../../src/app/attendance/dto/attendance-action.dto';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const mockAttendanceService = {
    getList: jest.fn(),
    recordAction: jest.fn(),
    getSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getList', () => {
    it('should forward filters and pagination to attendanceService', async () => {
      const query = {
        employee_id: '1',
        date: '2026-11-18',
        page: 2,
        pageSize: 10,
      };
      const expectedResponse = {
        code: '00',
        message: 'Success',
        data: {
          attendances: [],
          pagination: { page: 2, pageSize: 10, total: 0, totalPages: 0 },
        },
      };

      mockAttendanceService.getList.mockResolvedValue(expectedResponse);

      const mockReq = { headers: {} } as unknown as Request;
      const result = await controller.getList(query, mockReq);

      expect(mockAttendanceService.getList).toHaveBeenCalledWith(query, mockReq.headers);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('recordAction', () => {
    it('should forward action to attendanceService', async () => {
      const dto = {
        employee_id: '1',
        action: AttendanceAction.ClockIn,
        date: '2026-11-18',
      };
      const expectedResponse = {
        code: '00',
        message: 'Success',
        data: {
          uuid: 'test-uuid',
          employeeId: '1',
          date: '2026-11-18',
          status: 'clock-in',
          clockIn: new Date(),
          clockOut: null,
        },
      };

      mockAttendanceService.recordAction.mockResolvedValue(expectedResponse);

      const mockReq = { headers: { authorization: 'Bearer token123' } } as unknown as Request;
      const result = await controller.recordAction(dto, mockReq);

      expect(mockAttendanceService.recordAction).toHaveBeenCalledWith(dto, mockReq.headers);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getSummary', () => {
    it('should forward summary query to attendanceService', async () => {
      const query = { employee_id: '1', start_date: '2026-11-01', end_date: '2026-11-18' };
      const expectedResponse = {
        code: '00',
        message: 'Success',
        data: {
          employee_id: '1',
          start_date: '2026-11-01',
          end_date: '2026-11-18',
          total_days: 1,
          attendances: [],
        },
      };

      mockAttendanceService.getSummary.mockResolvedValue(expectedResponse);

      const mockReq = { headers: {} } as unknown as Request;
      const result = await controller.getSummary(query, mockReq);

      expect(mockAttendanceService.getSummary).toHaveBeenCalledWith(
        { employee_id: '1', start_date: '2026-11-01', end_date: '2026-11-18' },
        mockReq.headers,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException if employee_id is missing', async () => {
      const mockReq = { headers: {} } as unknown as Request;
      await expect(controller.getSummary({}, mockReq)).rejects.toThrow(
        'employee_id is required',
      );
    });
  });
});
