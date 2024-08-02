import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/service/users.service';
import { AuthPayloadDto } from '../domain/dto/auth.dto';
import { CreateUserDto } from '../../users/domain/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtservice: JwtService,
    private userService: UsersService,
  ) {}

  async login({ username, password }: AuthPayloadDto) {
    const user = await this.userService.findOne(username);
    console.log({ user });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException();
    }
    const { password: password2, ...result } = user;
    return {
      access_token: this.jwtservice.sign(result),
    };
  }

  async register(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
