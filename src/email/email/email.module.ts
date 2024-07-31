import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { GithubIneractionService } from '../../github-ineraction/github-ineraction.service';
import { EmailService } from '../email-service/email.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          auth: {
            user: configService.get<string>('USERNAME'),
            pass: configService.get<string>('USERPASSWORD'),
          },
        },
        defaults: {
          from: `"No reply <${configService.get<string>('EMAIL_FROM')}"`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
