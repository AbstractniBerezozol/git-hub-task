import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubIneractionService } from './github-ineraction/github-ineraction.service';
import { GithubInteractionController } from './github-ineraction/github-interaction.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GitRepository } from './github-ineraction/github-interaction/repository/repository.entity';
import { JwtModule } from '@nestjs/jwt';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { GithubInteractionModule } from './github-ineraction/github-interaction.module';
import { EmailModule } from './email/email/email.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import Handlebars from 'handlebars';
import { EmailService } from './email/email-service/email.service';

@Module({
  imports: [
    GithubInteractionModule,
    UsersModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: '',
          pass: '',
        },
      },
      defaults: {
        from: '',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options:{
          strict: true,
        }
      }
    }),

    
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
