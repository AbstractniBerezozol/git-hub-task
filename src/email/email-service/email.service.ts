import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { AuthPayloadDto } from 'src/auth/dto/auth.dto';
import { UsersService } from '../../users/users.service';

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

  async sendMounthSummary(userEmail: string, summary: string) {
    const subject = 'Here is your mounth summary';
    const text = `Hello, please, here is your monthly summary activity:\n\n${summary}`;
    await this.mailerService.sendMail({
      to: userEmail,
      subject: subject,
      text: text,
    });
  }

  async sendTest(email: string) {
    console.log(email);
    const subject = 'Here here here';
    const text = `Hello, please, here is your death`;
    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      text: text,
    });
  }

  // private transporter;
  // private userService: UsersService;
  // constructor(private configService: ConfigService) {
  //   this.transporter = nodemailer.createTransport({
  //     service: 'gmail',
  //     auth: { AuthPayloadDto },
  //   });
  // }

  // async userEmail(username: string) {
  //   let user = this.userService.findOne(username);
  //   return (await user).email;
  // }

  // async userRepoList(username: string) {
  //   let user = this.userService.findOne(username);
  //   return (await user).email;
  // }

  // async sendEmail(to: string, subject: string, text: string) {
  //   const letter = {
  //     from: this.configService.get<string>('EMAIL'), //must be a string
  //     to, // list of recievers
  //     subject, // notification or months summary
  //     text, // Greeting and list with repositories
  //   };

  //   try {
  //     await this.transporter.sendEmail(letter);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async sendMonthlySummary(
  //   userEmail: string,
  //   username: string,
  //   repositories: { name: string }[],
  // ) {
  //   const subject = 'Monthly Summary';
  //   const repolist = repositories.map((repo) => `${repo.name}`).join('\n');
  //   const text = `Hello, ${username}, \n This summary is for you.`;
  //   await this.sendEmail(userEmail, subject, text);
  // }
}
