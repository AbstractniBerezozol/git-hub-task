import { GitRepository } from 'src/github-ineraction/github-interaction/repository/repository.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Repository } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @OneToMany(() => GitRepository, repository => repository.user)
  repositories: GitRepository[];
}
