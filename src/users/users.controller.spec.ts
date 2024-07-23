import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

// describe('UserController', () => {
//   let usersController: UsersController;
//   let usersService: UsersService;
//   let userRep: Repository<User>;
  

//   beforeEach(async () => {
//     usersService = new UsersService(userRep);
//     usersController = new UsersController(usersService);
//   });

//   describe('findAll',() => {
//     it('should return an array with users', async () => {
//       const result = ['test'];
//       jest.spyOn(usersService, 'findAll').mockImplementation(() => result);

//       expect(await usersController.findAll()).toBe(result);
//     })
//   })
// });
