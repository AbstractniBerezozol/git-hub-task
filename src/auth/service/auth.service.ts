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
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException();
    }
    const { password: password2, ...result } = user;
    return {
      access_token: this.jwtservice.sign(result),
      refresh_token: this.jwtservice.sign(result, { expiresIn: '15h' }),
    };
  }

  async register(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  async generateRefreshToken(username: string): Promise<string> {
    const refreshTokenPayload = { sub: username };
    const refreshToken = this.jwtservice.sign(refreshTokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
    return refreshToken;
  }
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const decoded = this.jwtservice.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      console.log({ decoded });

      const user = await this.userService.findOne(decoded.username);

      if (!user) {
        throw new UnauthorizedException();
      }

      const payload = { username: user.username, sub: user.username };
      const newAccessToken = this.jwtservice.sign(payload);
      const newRefreshToken = await this.generateRefreshToken(user.username);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      console.log({ e });
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
