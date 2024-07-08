import { Injectable } from '@nestjs/common';
import { Users } from './entities/users.entitity';

@Injectable()
export class UsersService {
  private users: Users[] = [
    {
      id: 1,
      nickname: 'Lev',
      email: 'At@at',
      password: 'tritata',
      gitRepsList: ['tri', 'cetire', 'pet'],
    },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    return this.users.find((item) => item.id === +id);
  }

  create(createUserDto: any) {
    this.users.push(createUserDto);
  }

  update(id: string, updateCoffeeDto: any) {
    const existingUser = this.findOne(id);
    if (existingUser) {
      // update the existing entity
    }
  }

  remove(id: string) {
    const userIndex = this.users.findIndex((item) => item.id === +id);
    if (userIndex >= 0) {
      this.users.splice(userIndex, 1);
    }
  }
}
