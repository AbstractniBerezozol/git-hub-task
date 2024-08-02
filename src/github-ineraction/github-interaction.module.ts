import { Module } from '@nestjs/common';
import { GithubIneractionService } from './service/github-ineraction.service';
import { GithubInteractionController } from './controller/github-interaction.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { User } from '../users/domain/user.entity';
import { GitRepository } from './domain/entity/repository.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, GitRepository]), HttpModule, EmailModule],
  controllers: [GithubInteractionController],
  providers: [GithubIneractionService,],
})
export class GithubInteractionModule {}
