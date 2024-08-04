import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { GitRepository } from '../../../github-ineraction/domain/entity/repository.entity';

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
