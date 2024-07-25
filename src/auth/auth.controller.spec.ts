import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { ServerCapabilities } from 'typeorm';
import { AuthPayloadDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

// describe('AuthController', () => {
//   let controller: AuthController;
//   let service: AuthService;
//   let jwtservice: JwtService;
//   let userService: UsersService;
//   let authPayloadDto: AuthPayloadDto;

//   beforeEach(async () => {
//     service = new AuthService(jwtservice, userService);
//     controller = new AuthController(service);
//   });
//   describe('login', () => {
//     it('should return users page', async () => {
//       const result = [authPayloadDto.username, authPayloadDto.password];
//       jest.spyOn(service, 'login').mockImplementation(() => result);

//       expect(await controller.login(authPayloadDto)).toBe(result);
//     });
//   });
// });
