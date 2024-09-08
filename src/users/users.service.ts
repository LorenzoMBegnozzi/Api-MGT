import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email } = createUserDto;

    const existingUser = await this.userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ConflictException('Nome de usuário ou e-mail já em uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      email,
    });

    return await newUser.save();
  }

  async findOneById(id: string): Promise<User | undefined> {
    console.log(`Encontrando usuário com ID: ${id}`);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    console.log(`Encontrando usuário com nome de usuário: ${username}`);
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    console.log(`Atualizando usuário com ID: ${id}`);
    console.log(`Dados de atualização: ${JSON.stringify(updateUserDto)}`);

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updateData: Partial<UpdateUserDto> = { ...updateUserDto };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(user, updateData);
    await user.save();

    console.log(`Usuário com ID: ${id} atualizado com sucesso.`);
    return user;
  }

  async updateByUsername(username: string, updateUserDto: UpdateUserDto): Promise<User> {
    console.log(`Atualizando usuário com nome de usuário: ${username}`);
    console.log(`Dados de atualização: ${JSON.stringify(updateUserDto)}`);

    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updateData: Partial<UpdateUserDto> = { ...updateUserDto };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(user, updateData);
    await user.save();

    console.log(`Usuário com nome de usuário: ${username} atualizado com sucesso.`);
    return user;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Usuário não encontrado');
    }

    console.log(`Usuário com ID: ${id} deletado com sucesso.`);
  }

  async deleteByUsername(username: string): Promise<void> {
    const result = await this.userModel.findOneAndDelete({ username });
    if (!result) {
      throw new NotFoundException('Usuário não encontrado');
    }

    console.log(`Usuário com nome de usuário: ${username} deletado com sucesso.`);
  }
}
