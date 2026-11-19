import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmployeeProfileDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(12)
  newPassword?: string;
}
