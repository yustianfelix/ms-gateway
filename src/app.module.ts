import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './app/attendance/attendance.module';
import { AuthModule } from './app/auth/auth.module';
import { EmployeeModule } from './app/employee/employee.module';
import { AuthGuard } from './app/auth/guard/auth.guard';

@Module({
  imports: [AttendanceModule, AuthModule, EmployeeModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
