import { Module } from '@nestjs/common';
import { GithubIneractionService } from './service/github-ineraction.service';
import { GithubInteractionController } from './controller/github-interaction.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { User } from '../users/domain/entity/user.entity';
import { GitRepository } from './domain/entity/repository.entity';
import { GitHubScheduler } from './domain/scheduler/github-scheduler';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User, GitRepository]),    JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '1h' },
    }),
    inject:[ConfigService]
  }), HttpModule, EmailModule],
  controllers: [GithubInteractionController],
  providers: [GithubIneractionService,GitHubScheduler],
})
export class GithubInteractionModule {}
