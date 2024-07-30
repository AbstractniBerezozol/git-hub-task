import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { response } from 'express';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GitRepository } from './github-interaction/repository/repository.entity';
import { User } from 'src/users/entities/user.entity';
import { SearchBy } from './github-interaction/repository/repository.enum';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email-service/email.service';

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
    return this.userRep.findOne({
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
        throw new HttpException('No case', 400);
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

  // async searchRepositories(searchBy: SearchBy, name: string): Promise<any> {
  //   const token = this.configService.get<string>('GITHUB_TOKEN');
  //   const headers = {
  //     Authorization: `token ${token}`,
  //   };

  //   try {
  //     const result = await firstValueFrom(
  //       this.httpService.get(`${this.githubApiUrl}/search/repositories`, {
  //         headers,
  //         params: { q: `${name} ${searchBy}` },
  //       }),
  //     );

  //     return result.data;
  //   } catch (error) {
  //     throw new HttpException(error.response.data, error.response.status);
  //   }
  // }

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
        releases: repo.releases,
        user,
      });

      this.gitRepository.save(newRepo);

      return this.gitRepository.find({
        where: { user: { username: user.username } },
      });
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
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

  async checkForUpdates() {
    const repositories = await this.gitRepository.find({ relations: ['user'] });
    for (const repo of repositories) {
      try {
        const url = `${this.githubApiUrl}/repositories/${repo.repoId}`;
        const response = await this.httpService.get(url).toPromise();
        const currentRepo = response.data;

        const releaseUrl = `${this.githubApiUrl}/repos/${repo.full_name}/releases`;
        const releasesResponse = await this.httpService.get(releaseUrl).toPromise();
        const currentReleases = releasesResponse.data;

        if (
          currentRepo.stargazers_count !== repo.stargazers_count ||
          currentRepo.watchers_count !== repo.watchers_count ||
          currentRepo.forks_count !== repo.forks_count ||
          JSON.stringify(currentReleases) !== JSON.stringify(repo.releases)
        ) {
        //   const updateDetails = `Stargazers: ${currentRepo.stargazers_count},
        //  Watchers: ${currentRepo.watchers_count}, Forks: ${currentRepo.forks_count}`;
          await this.emailService.sendNotification(repo.user.email, repo.name);

          repo.stargazers_count = currentRepo.stargazers_count;
          repo.watchers_count = currentRepo.watchers_count;
          repo.forks_count = currentRepo.forks_count;
          repo.releases= currentReleases;

          await this.gitRepository.save(repo);
        }
      } catch (error) {
        console.error('Failed to check the updates for repository', error);
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
}
