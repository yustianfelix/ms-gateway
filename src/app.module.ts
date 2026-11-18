import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './app/attendance/attendance.module';
import { AuthModule } from './app/auth/auth.module';
import { EmployeeModule } from './app/employee/employee.module';

@Module({
  imports: [AttendanceModule, AuthModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
