import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthPayloadDto } from './dto/auth.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('AuthService', () => {
  let authService: AuthService;


  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockAuthService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
  it('login => should return jwt token for logging', async () => {
    const authPayloadDto = {
      username: 'Coco',
      password: 'Coco123',
    } as AuthPayloadDto;

    const user = {
      id: 1,
      username: 'Coco',
      password: 'Coco123',
      repositories: [],
    } as User;

    jest.spyOn(mockAuthService, 'login').mockReturnValue(user);

    const result = await authService.login(authPayloadDto);

    expect(result).toEqual(user);

    expect(mockAuthService.login).toBeCalled();
    expect(mockAuthService.login).toBeCalledWith(authPayloadDto);
  });
  it('register => should creates new user', async () => {
    const createUserDto = {
      username: 'Coco',
      password: 'Coco123',
      email: 'Coco@singimail.rs',
    } as CreateUserDto;
    const user = {
      id: 1,
      username: 'Coco',
      password: 'Coco123',
      email: 'Coco@singimail.rs',
      repositories: [],
    } as User;

    jest.spyOn(authService, 'register').mockResolvedValue(user);

    const result = await authService.register(createUserDto);

    expect(mockAuthService.register).toBeCalled();
    expect(mockAuthService.register).toBeCalledWith(createUserDto);

    expect(result).toEqual(user);
  });
});
