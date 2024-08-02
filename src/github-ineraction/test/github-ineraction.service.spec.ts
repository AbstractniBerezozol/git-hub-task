import { Test, TestingModule } from '@nestjs/testing';
import { GithubIneractionService } from '../../src/service/github-ineraction.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../src/email/service/email.service';
import { Repository } from 'typeorm';
import { User } from '../../src/domain/entity/user.entity';
import { GitRepository } from '../../src/domain/entity/repository.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockHttpService = {
  get: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('mocked_github_token'),
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
};

const mockEmailService = {
  sendNotification: jest.fn(),
  sendMounthSummary: jest.fn(),
};
describe('GithubIneractionService', () => {
  let githubInteractionService: GithubIneractionService;
  let httpService: HttpService;
  let configService: ConfigService;
  let emailService: EmailService;
  let userRepostory: Repository<User>;
  let gitRepository: Repository<GitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubIneractionService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
        { provide: EmailService, useValue: emailService },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        {
          provide: getRepositoryToken(GitRepository),
          useValue: mockRepository,
        },
      ],
    }).compile();

    githubInteractionService = module.get<GithubIneractionService>(
      GithubIneractionService,
    );
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
    userRepostory = module.get<Repository<User>>(getRepositoryToken(User));
    gitRepository = module.get<Repository<GitRepository>>(
      getRepositoryToken(GitRepository),
    );

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  it('should be defined', () => {
    expect(githubInteractionService).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        repositories: [],
      };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await githubInteractionService.getUser('Coco');
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'Coco' },
      });
      it('should throw an error if user is not found', async () => {
        mockRepository.findOne.mockResolvedValue(undefined);

        expect(githubInteractionService.getUser('Coco')).rejects;
      });
    });
  });
});
