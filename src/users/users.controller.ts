import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Get('username/:username')
  async findOneByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return {
      message: `Usuário com ID: ${id} atualizado com sucesso.`,
      user: updatedUser
    };
  }

  @Put('username/:username')
  async updateByUsername(@Param('username') username: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.updateByUsername(username, updateUserDto);
    return {
      message: `Usuário : ${username} atualizado com sucesso.`,
      user: updatedUser
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return {
      message: `Usuário com ID: ${id} deletado com sucesso.`
    };
  }

  @Delete('username/:username')
  async deleteByUsername(@Param('username') username: string) {
    await this.usersService.deleteByUsername(username);
    return {
      message: `Usuário: ${username} deletado com sucesso.`
    };
  }
}

