import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/role.enum'; // Ajuste o caminho conforme necessário

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userRole = user.role;

    if (!roles.includes(userRole)) {
      throw new ForbiddenException('Acesso negado. Somente usuários com permissão apropriada podem acessar essa rota.');
    }

    return true;
  }
}
