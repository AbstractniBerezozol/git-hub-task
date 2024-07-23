import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GitRepository {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    repoId: number;

    @Column()
    name: string;

    @Column()
    full_name: string;

    @Column()
    html_url: string;

    @Column()
    description: string;

    @Column()
    language: string;

    @Column()
    stargazers_count: number;

    @Column()
    watchers_count: number;

    @Column()
    forks_count: number;

    @ManyToOne(() => User, user => user.repositories)
    user: User;
}
