import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthPayloadDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import passport from 'passport';

const mockUserService = {
  findOne: jest.fn(),
};
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockAccessToken'),
};
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
  describe('login', () => {
    it('should throw an exception if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);
      await expect(
        authService.login({ username: 'Coco', password: 'Coco123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an exception if password is wrong', async () => {
      const user = { username: 'Coco', password: 'Coco123' };
      mockUserService.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
      await expect(
        authService.login({ username: 'Coco', password: 'garantija' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it(' should return jwt token for logging', async () => {
      const user = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        repositories: [],
      } as User;
      mockUserService.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await authService.login({
        username: 'Coco',
        password: 'Coco123',
      });
      expect(result).toHaveProperty('access_token');
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'Coco' });
    });
  });

  // it('register => should creates new user', async () => {
  //   const createUserDto = {
  //     username: 'Coco',
  //     password: 'Coco123',
  //     email: 'Coco@singimail.rs',
  //   } as CreateUserDto;
  //   const user = {
  //     id: 1,
  //     username: 'Coco',
  //     password: 'Coco123',
  //     email: 'Coco@singimail.rs',
  //     repositories: [],
  //   } as User;

  //   jest.spyOn(usersService, 'create').mockResolvedValue(user);

  //   const result = await usersService.create(createUserDto);

  //   expect(usersService.create).toBeCalled();
  //   expect(usersService.create).toBeCalledWith(createUserDto);

  //   expect(result).toEqual(user);
  // });
});
