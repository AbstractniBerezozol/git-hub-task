import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { create } from 'domain';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('create => creates a new user and returns its data', async () => {
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

    jest.spyOn(mockUserService, 'create').mockReturnValue(user);

    const result = await service.create(createUserDto);

    expect(mockUserService.create).toBeCalled();
    expect(mockUserService.create).toBeCalledWith(createUserDto);

    expect(result).toEqual(user);
  });
  it('findAll => finds all users by username and returns a list of its data', async () => {
    const user = {
      id: 1,
      username: 'Coco',
      password: 'Coco123',
      email: 'Coco@singimail.rs',
      repositories: [],
    } as User;

    const users = [user];

    jest.spyOn(mockUserService, 'findAll').mockReturnValue(user);

    const result = await service.findAll();
    expect(result).toEqual(users);
    expect(mockUserService.findAll).toBeCalled();
  });
  it('findOne => finds one user by username and returns its data', async () => {
    const user = {
      id: 1,
      username: 'Coco',
      password: 'Coco123',
      email: 'Coco@singimail.rs',
      repositories: [],
    } as User;
    const username = 'Coco';

    jest.spyOn(mockUserService, 'findOne').mockReturnValue(user);

    const result = await service.findOne(username);
    expect(result).toEqual(user);

    expect(mockUserService.findOne).toBeCalled();
    expect(mockUserService.findOne).toBeCalledWith({ where: { username } });
  });

  it('update => changes the user and returns its data', async () => {
    const username = 'Coco';
    const updateUserDto = {
      username: 'Coco',
      password: 'Coco12345',
      email: 'Coco@singimail.rs',
    };

    const user = {
      id: 1,
      username: 'Coco',
      password: 'Coco123',
      email: 'Coco@singimail.rs',
      repositories: [],
    } as User;

    jest.spyOn(mockUserService, 'update').mockReturnValue(user);

    const result = await service.update(username, updateUserDto);

    expect(result).toEqual(user);

    expect(mockUserService.update).toBeCalled();
    expect(mockUserService.findOne).toBeCalledWith(username, updateUserDto);
  });
  it('delete => finds the user and delete it', async () => {
    const username = 'Coco';
    const user = {
      id: 1,
      username: 'Coco',
      password: 'Coco123',
      email: 'Coco@singimail.rs',
      repositories: [],
    } as User;

    jest.spyOn(mockUserService, 'delete').mockReturnValue(username);

    const result = await service.remove(username);

    expect(result).toEqual(user);

    expect(mockUserService.delete).toBeCalled();
    expect(mockUserService.delete).toBeCalledWith(username);
  });
});
