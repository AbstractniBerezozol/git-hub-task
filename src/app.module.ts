import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubIneractionService } from './github-ineraction/github-ineraction.service';
import { GithubInteractionController } from './github-ineraction/github-interaction.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GitRepository } from './github-ineraction/github-interaction/repository/repository.entity';

@Module({
  imports: [
    UsersModule,AuthModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // type of our database
      host: 'localhost', // database host
      port: 5432, // database host
      username: 'postgres', // username
      password: 'pass123', // user password
      database: 'postgres', // name of our database,
      autoLoadEntities: true, // models will be loaded automatically
      synchronize: true,
    }), ConfigModule.forRoot({isGlobal: true,}), HttpModule, TypeOrmModule.forFeature([GitRepository])
  ],
  controllers: [AppController, GithubInteractionController],
  providers: [AppService, GithubIneractionService],
})
export class AppModule {}
