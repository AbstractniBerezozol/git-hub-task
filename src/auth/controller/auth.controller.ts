import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthPayloadDto } from '../domain/dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/domain/dto/create-user.dto';

@ApiTags('auth')
@ApiBearerAuth()
@ApiTags()

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

 
  @Post('login')
  async login(@Body() data: AuthPayloadDto) {
    return this.authService.login(data);
  }

  @Post('register')
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @Get('profile')
  getProfile(@Request() req ) {
    return req.user;
  }
}
