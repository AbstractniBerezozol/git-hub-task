import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../domain/dto/create-user.dto';
import { UpdateUserDto } from '../domain/dto/update-user.dto';
import { UserRole } from '../domain/enum/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateRefreshToken(
    username: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.update(username, { refreshToken });
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: { repositories: true },
    });
    for (const user of users) {
      delete user.password;
    }
    return users;
  }

  async findOne(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(`User #${username} not found`);
    }
    return user;
  }

  async findOneUserWithRepos(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: { repositories: true },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async userWithNoPassword(username: string) {
    const user = this.findOneUserWithRepos(username);
    delete (await user).password;
    return user;
  }
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const username = createUserDto.username;
    const email = createUserDto.email;
    const roles = createUserDto.roles;
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      roles: roles || [UserRole.USER],
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
    return this.userRepository.softRemove(user);
  }
}
