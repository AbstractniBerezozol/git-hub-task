import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchBy } from '../domain/enum/repository.enum';
import { GitRepository } from '../domain/entity/repository.entity';
import { User } from '../../users/domain/entity/user.entity';
import { EmailService } from '../../email/service/email.service';

@Injectable()
export class GithubIneractionService {
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userRep: Repository<User>,
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>,
  ) {}

  async getUser(username: string): Promise<User> {
    return this.userRep.findOneOrFail({
      where: { username },
      relations: ['repositories'],
    });
  }

  // async userWithNoPassword(username: string) {
  //   const user = this.getUser(username);
  //   (await user).password = '123';
  //   return user;
  // }

  async searchRepositories(
    searchBy: SearchBy,
    name: string,
    owner: string,
  ): Promise<any> {
    let query: string;
    console.log(searchBy);

    switch (searchBy) {
      case SearchBy.name:
        console.log(searchBy);
        query = `name:${name}`;
        break;

      case SearchBy.description:
        query = `description:${name}`;
        break;

      case SearchBy.topics:
        query = `topics:${name}`;
        break;

      case SearchBy.readme:
        query = `readme:${name}`;
        break;

      case SearchBy.repoOwner:
        query = `"repo:${owner}/${name}"`;
        break;

      default:
        throw new BadRequestException('Something went wrong');
    }
    console.log(query);

    const url = `${this.githubApiUrl}/search/repositories?q=${query}`;
    try {
      const response = await this.httpService.get(url).toPromise();
      return response.data.items;
    } catch (error) {
      console.error('error searching reps', error);
      throw new HttpException('Error searching', 500);
    }
  }

  async addRepository(repoId: number, user: User): Promise<GitRepository[]> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const headers = {
      Authorization: `token ${token}`,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/repositories/${repoId}`, {
          headers,
        }),
      );

      const repo = response.data;
      const newRepo = this.gitRepository.create({
        repoId: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        forks_count: repo.forks_count,
        latestRelease: repo.latestRelease,
        user,
      });

      this.gitRepository.save(newRepo);

      return this.gitRepository.find({
        where: { user: { username: user.username } },
      });
    } catch (error) {
      throw console.error(error);
    }
  }

  async deleteRepository(repoId: number): Promise<void> {
    const repository = await this.gitRepository.findOne({
      where: { repoId: repoId },
    });
    if (!repository) {
      throw new HttpException('not found', 404);
    }
    await this.gitRepository.remove(repository);
  }

  async getWatchlist(user: User): Promise<GitRepository[]> {
    return this.gitRepository.find({ where: { user: user } });
  }

  async getLatestReliase(gitRepository: GitRepository) {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const headers = {
      Authorization: `token ${token}`,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.githubApiUrl}/repos/${gitRepository.full_name}/latest`,
          {
            headers,
          },
        ),
      );
      return response.data.name;
    } catch (error) {
      console.log(
        `For repository ${gitRepository.repoId} latest reliase is not found`,
      );
    }
  }

  async checkForUpdates() {
    const repositories = await this.gitRepository.find({ relations: ['user'] });
    for (const repo of repositories) {
      const release = await this.getLatestReliase(repo);
      if (repo.latestRelease != release) {
        repo.latestRelease = release;
        this.gitRepository.save(repo);

        this.emailService.sendNotification(repo.user.email, repo.name);
      }
    }
  }

  async sendMonthSummary() {
    const users = await this.userRep.find({ relations: ['repositories'] });
    for (const user of users) {
      const summary = user.repositories
        .map((repo) => `- ${repo.name} `)
        .join('\n');
      await this.emailService.sendMounthSummary(user.email, summary);
    }
  }

  async testEmailing(email: string) {
    console.log(email);
    await this.emailService.sendTest(email);
  }
}
