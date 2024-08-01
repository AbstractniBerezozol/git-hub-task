

import { ApiProperty } from '@nestjs/swagger';
import { GitRepository } from '../../github-ineraction/github-interaction/repository/repository.entity'
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Repository } from 'typeorm';

@Entity()
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
  @OneToMany(() => GitRepository, repository => repository.user,)
  repositories: GitRepository[];
}
