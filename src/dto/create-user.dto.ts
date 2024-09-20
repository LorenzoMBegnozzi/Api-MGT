import { IsString, MinLength, MaxLength, IsEmail } from 'class-validator';
import { Role } from '../auth/decorators/role.enum'; 

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

  @IsString() 
  readonly role: Role; 
}
