import { Module } from '@nestjs/common';
import { GithubIneractionService } from './github-ineraction.service';
import { GithubInteractionController } from './github-interaction.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitRepository } from './github-interaction/repository/repository.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, GitRepository]), HttpModule],
  controllers: [GithubInteractionController],
  providers: [GithubIneractionService],
})
export class GithubInteractionModule {}
