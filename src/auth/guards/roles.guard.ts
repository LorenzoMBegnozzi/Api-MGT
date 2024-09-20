import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Se não houver roles definidas, permite acesso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Usuário não autenticado ou sem função definida');
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    if (!roles.some(role => userRoles.includes(role))) {
      throw new ForbiddenException('Acesso negado. Somente usuários com permissão apropriada podem acessar essa rota.');
    }

    return true;
  }
}
