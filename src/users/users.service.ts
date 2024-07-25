import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    for (const user of users) {
      delete user.password;
    }
    return users;
  }

  async findOne(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User #${username} not found`);
    }
    // const userWithNoPass = user;
    // delete userWithNoPass.password;
    return user;
  }
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const username = createUserDto.username;
    const email = createUserDto.email;
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }
  async update(username: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      username,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User #${username} not found`);
    }
    return this.userRepository.save(user);
  }

  async remove(username: string) {
    const user = await this.findOne(username);
    return this.userRepository.remove(user);
  }
}
