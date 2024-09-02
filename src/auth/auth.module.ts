import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller'; // Importe o AuthController

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'banana',
      signOptions: { expiresIn: '60m' },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController], // Adicione o AuthController aqui
  exports: [AuthService],
})
export class AuthModule {}
