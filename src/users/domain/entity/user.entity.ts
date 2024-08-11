import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { GitRepository } from '../../../github-ineraction/domain/entity/repository.entity';
import { UserRole } from '../enum/roles.enum';

@Entity()
@Unique('unique_username', ['username'])
@Unique('unique_email', ['email'])
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  roles: string[];
  @OneToMany(() => GitRepository, (repository) => repository.user)
  repositories: GitRepository[];
}
