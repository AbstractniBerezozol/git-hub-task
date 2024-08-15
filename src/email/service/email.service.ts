import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendNotification(userEmail: string, repoName: string) {
    const subject = 'Here is update from your list!';
    const text = `Hello, it is update ${repoName} from your Watchlist!!!`;
    await this.mailerService.sendMail({
      to: userEmail,
      subject: subject,
      text: text,
    });
  }

  async sendMonthSummary(userEmail: string, summary: string) {
    const subject = 'Here is your month summary';
    const text = `Hello, please, here is your monthly summary activity:\n\n${summary}`;
    await this.mailerService.sendMail({
      to: userEmail,
      subject: subject,
      text: text,
    });
  }


}
