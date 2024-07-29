import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

import * as nodemailer from 'nodemailer';
import { GithubIneractionService } from '../../github-ineraction/github-ineraction.service';

@Module({
  imports: [MailerModule.forRoot({}), ],
  
})
export class EmailModule {}
