import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../../src/users/service/users.service';
import { UsersController } from '../../src/users/controller/users.controller';


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


