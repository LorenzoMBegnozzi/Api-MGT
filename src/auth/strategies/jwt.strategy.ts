import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../guards/jwt-payload.interface'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
    });

    if (!process.env.JWT_SECRET) {
      console.warn('WARNING: JWT_SECRET is not defined. Using default secret, which is not secure!');
    }
  }

  async validate(payload: JwtPayload) {
    // Aqui você pode adicionar mais verificações ou consultar o banco de dados se necessário
    return { userId: payload.userId, role: payload.role }; 
  }
}
