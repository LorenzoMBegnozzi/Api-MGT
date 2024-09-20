// src/users/dto/create-user.dto.ts
import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator';
import { Role } from '../auth/decorators/role.enum'; // Altere o caminho conforme necessário

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  readonly username: string;

  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsEmail()
  readonly email: string;

  @IsString() // Adicione a validação se necessário
  readonly role: Role; // ou apenas string, dependendo da sua implementação
}
