import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Public } from './guard/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() credentials: LoginDto, @Req() req: Request) {
    return this.authService.login(credentials, req.headers);
  }
}
