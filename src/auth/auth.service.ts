import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { retry } from 'rxjs';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AuthService {
  constructor(
    private jwtservice: JwtService,
    private userService: UsersService,
  ) {}

  

  async login({ username, password }: AuthPayloadDto) {
    const user = await this.userService.findOne(username);
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
