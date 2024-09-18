import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(userId: string, username: string, role: string) {
    const payload = { userId, username, role };
    return this.jwtService.sign(payload);
  }
}
