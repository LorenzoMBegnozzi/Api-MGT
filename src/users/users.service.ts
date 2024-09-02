import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, email } = createUserDto;

    // Verificar se o usuário ou email já existe
    const existingUser = await this.userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ConflictException('Username or email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      email,
    });

    try {
      return await newUser.save();
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email });
  }
}
