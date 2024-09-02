import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/Login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
async login(@Body() loginDto: LoginDto) {
  console.log('Login request received:', loginDto); 
  return this.authService.login(loginDto);
}
}
