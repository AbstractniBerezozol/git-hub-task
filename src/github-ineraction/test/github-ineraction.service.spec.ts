import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from '../../email/service/email.service';
import { User } from '../../users/domain/entity/user.entity';
import { GitRepository } from '../domain/entity/repository.entity';
import { GithubIneractionService } from '../service/github-ineraction.service';
import { name } from 'ejs';
import { SearchBy } from '../domain/enum/repository.enum';
import { HttpException } from '@nestjs/common';
import exp from 'constants';
import { rejects } from 'assert';

const mockHttpService = {
  get: jest.fn(),
};

enum mockSearchBy {
  name = 'name',
  description = 'description',
  topics = 'topics',
  readme = 'readme',
  repoOwner = 'repoOwner',
}

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
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        relations: ['repositories'],
      });
    });
    it('should throw an error if user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(
        githubInteractionService.getUser('Coco23'),
      ).rejects.toThrowError();
    });
  });

  describe('searchRepositories', () => {
    it('should search repositories by name', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 1, name: 'repo1' },
            { id: 2, name: 'repo2' },
          ],
        },
      };
      mockHttpService.get.mockResolvedValue(mockResponse);

      const result = await githubInteractionService.searchRepositories(
        SearchBy.name,
        'repo1',
        '',
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.github.com/search/repositories?q=name:repo1',
      );
      expect(result).toEqual(mockResponse.data.items);
    });
    it('should handle errors during repos search', async () => {
      mockHttpService.get.mockRejectedValue(new Error('API Error'));
      await expect(
        githubInteractionService.searchRepositories(SearchBy.name, 'repo1', ''),
      ).rejects.toThrowError(HttpException);
    });
  });

  describe('addRepository', () => {
    it('should add repository to the watchlist', async () => {
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        repositories: [],
      };
      const mockRepoId = 12345;
      const mockResponse = {
        data: {
          id: mockRepoId,
          name: 'mockingRepository',
          full_name: 'alexander/mockingRepository',
          html_url: 'https://github.com/alexander/mockingRepository',
          description: 'Here is test repository for something incredible',
          language: 'TypeScript',
          stargazers_count: 103,
          watchers_count: 6,
          forks_count: 10509,
          latestRelease: 'v1.7.19',
        },
      };
      mockHttpService.get.mockResolvedValue(mockResponse);

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.create.mockReturnValue({ id: 1, repoId: mockRepoId });
      mockRepository.save.mockResolvedValue({ id: 1, repoId: mockRepoId });

      const result = await githubInteractionService.addRepository(
        mockRepoId,
        mockUser,
      );
      expect(result.length).toBeGreaterThan(0);
      expect(mockRepository.save).toHaveBeenCalled();
    });
    it('should handle errors during repos adding', async () => {
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        repositories: [],
      };
      const mockRepoId = 12345;
      mockHttpService.get.mockRejectedValue(new Error('API Error'));
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        githubInteractionService.addRepository(mockRepoId, mockUser),
      ).rejects.toThrowError(HttpException);
    });
  });

  describe('deleteRepository', () => {
    it('should delete Repository from users watchlist', async () => {
      const mockRepoId = 12345;
      const mockRepositoryDelete: GitRepository = {
        id: 1,
        repoId: mockRepoId,
        user: {
          id: 1,
          username: 'Coco',
          password: 'Coco123',
          email: 'Coco@singimail.rs',
          repositories: [],
        },
        name: '',
        full_name: '',
        html_url: '',
        description: '',
        language: '',
        stargazers_count: 0,
        watchers_count: 0,
        forks_count: 0,
        latestRelease: '',
      };
      mockRepository.findOne.mockResolvedValue(mockRepositoryDelete);

      await githubInteractionService.deleteRepository(mockRepoId);
      expect(mockRepository.remove).toHaveBeenCalled();
    });
    it('should throw an erroe if repository is not found', async () => {
      const mockRepoId = 123;
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(
        githubInteractionService.deleteRepository(mockRepoId),
      ).rejects.toThrowError(HttpException);
    });
  });

  describe('getWatchliist', () => {
    it('should return user watchlist', async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: 'mockingRepository',
        full_name: 'alexander/mockingRepository',
        html_url: 'https://github.com/alexander/mockingRepository',
        description: 'Here is test repository for something incredible',
        language: 'TypeScript',
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: 'v1.7.19',
        repoId: 23,
        user: new User(),
      };
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        repositories: [mockedRepository],
      };
      mockRepository.find.mockResolvedValue(mockUser.repositories);

      const result = await githubInteractionService.getWatchlist(mockUser);
      expect(result).toEqual(mockUser.repositories);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: mockUser },
      });
    });
  });

  describe('getLatestReliase', () => {
    it('should find latest reliase from repository', async () => {
      const mockRepository: GitRepository = {
        id: 1,
        name: 'mockingRepository',
        full_name: 'alexander/mockingRepository',
        html_url: 'https://github.com/alexander/mockingRepository',
        description: 'Here is test repository for something incredible',
        language: 'TypeScript',
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: 'v1.7.19',
        repoId: 23,
        user: new User(),
      };
      const mockResponse = { data: { name: 'v2.1.23' } };
      mockHttpService.get.mockResolvedValue(mockResponse);

      const result =
        await githubInteractionService.getLatestReliase(mockRepository);
      expect(result).toEqual('v2.1.23');
    });

    it('should handle errors during getting the last reliase', async () => {
      const mockRepository: GitRepository = {
        id: 1,
        name: 'mockingRepository',
        full_name: 'alexander/mockingRepository',
        html_url: 'https://github.com/alexander/mockingRepository',
        description: 'Here is test repository for something incredible',
        language: 'TypeScript',
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: 'v1.7.19',
        repoId: 23,
        user: new User(),
      };
      mockHttpService.get.mockRejectedValue(new Error('API Error'));

      const result =
        await githubInteractionService.getLatestReliase(mockRepository);
      expect(result).toBeUndefined();
    });
  });

  describe('checkForUpdates', () => {
    it('should check for updates and notify is it was updated', async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: 'mockingRepository',
        full_name: 'alexander/mockingRepository',
        html_url: 'https://github.com/alexander/mockingRepository',
        description: 'Here is test repository for something incredible',
        language: 'TypeScript',
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: 'v1.7.19',
        repoId: 23,
        user: new User(),
      };
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        repositories: [mockedRepository],
      };
      mockRepository.find.mockResolvedValue([mockUser.repositories[0]]);
      const mockResponse = { data: { name: 'v2.14.78' } };
      mockHttpService.get.mockResolvedValue(mockResponse);

      await githubInteractionService.checkForUpdates();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendNotification).toHaveBeenCalledWith(
        mockUser.email,
        'testing repository',
      );
    });

    it('should not notify if it was not updated', async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: 'mockingRepository',
        full_name: 'alexander/mockingRepository',
        html_url: 'https://github.com/alexander/mockingRepository',
        description: 'Here is test repository for something incredible',
        language: 'TypeScript',
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: 'v1.7.19',
        repoId: 23,
        user: new User(),
      };
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        repositories: [mockedRepository],
      };

      mockRepository.find.mockResolvedValue([mockUser[0]]);
      const mockResponse = { data: { name: 'v1.7.19' } };
      mockHttpService.get.mockResolvedValue(mockResponse);

      await githubInteractionService.checkForUpdates();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendNotification).not.toHaveBeenCalled();
    });
    it('should handle all errors during update check', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(
        githubInteractionService.checkForUpdates(),
      ).rejects.toThrowError(HttpException);
    });
  });

  describe('sendMonthSummary', () => {
    it('should send monthly summary to users', async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: 'mockingRepository',
        full_name: 'alexander/mockingRepository',
        html_url: 'https://github.com/alexander/mockingRepository',
        description: 'Here is test repository for something incredible',
        language: 'TypeScript',
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: 'v1.7.19',
        repoId: 23,
        user: new User(),
      };
      const mockUser = {
        id: 1,
        username: 'Coco',
        password: 'Coco123',
        email: 'Coco@singimail.rs',
        repositories: [mockedRepository],
      };
      const mockUsers: User[] = [mockUser];
      const mockSummary = '- mockingRepository';
      mockRepository.find.mockResolvedValue(mockUsers);

      await githubInteractionService.sendMonthSummary();
      expect(mockEmailService.sendMounthSummary).toHaveBeenCalledWith(
        mockUser.email,
        mockSummary,
      );
    });

    it('should handle errors during summary sending', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(
        githubInteractionService.sendMonthSummary(),
      ).rejects.toThrowError(HttpException);
    });
  });
});
