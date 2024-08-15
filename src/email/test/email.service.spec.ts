import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from '../service/email.service';
const mockMailerService = {
  sendMail: jest.fn().mockResolvedValue({}),
};

describe('EmailService', () => {
  let emailService: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  it('should send notification email', async () => {
    const userMail = 'aleksandr.zolotarev@abstract.rs';
    const repoName = 'facebook/React';

    await emailService.sendNotification(userMail, repoName);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: userMail,
      subject: 'Here is update from your list!',
      text: `Hello, it is update ${repoName} from your Watchlist!!!`,
    });
  });

  it('should send summary email', async () => {
    const userMail = 'aleksandr.zolotarev@abstract.rs';
    const summary = 'Hello, please, here is your monthly summary activity';

    await emailService.sendMonthSummary(userMail, summary);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: userMail,
      subject: 'Here is your month summary',
      text: `Hello, please, here is your monthly summary activity:\n\n${summary}`,
    });
  });
});
