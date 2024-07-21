import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AuthPayloadDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { AuthPayloadDto },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    const letter = {
      from: this.configService.get<string>('EMAIL'),
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendEmail(letter);
    } catch (error) {
      throw error;
    }
  }

  async sendMonthlySummary(
    userEmail: string,
    username: string,
    repositories: { name: string }[],
  ) {
    const subject = 'Monthly Summary';
    const repolist = repositories.map((repo) => `${repo.name}`).join('\n');
    const text = `Hello, ${username}, \n This summary is for you.`;
    await this.sendEmail(userEmail, subject, text);
  }
}
