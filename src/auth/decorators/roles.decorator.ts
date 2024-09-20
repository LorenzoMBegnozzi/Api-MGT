import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum'; // Ajuste o caminho se necessário

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
