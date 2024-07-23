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

@Injectable()
export class GithubIneractionService {
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(GitRepository)
    private readonly gitRepository: Repository<GitRepository>,
  ) {}

  async searchRepositories(name: string, searchBy: SearchBy): Promise<any> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const headers = {
      Authorization: `token ${token}`,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/search/repositories`, {
          headers,
          params: { q: `${name} ,${searchBy}` },
        }),
      );
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async addRepository(user: User): Promise<GitRepository> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const headers = {
      Authorization: `token ${token}`,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.githubApiUrl}/repositories/${user.username}`,
          { headers },
        ),
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
        user,
      });
      return this.gitRepository.save(newRepo);
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async getWatchlist(user: User): Promise<GitRepository[]> {
    return this.gitRepository.find({ where: { user: user } });
  }
  // async getUser(username: string): Promise<any> {
  //   const token = this.configService.get<string>('GITHUB_TOKEN');
  //   const headers = {
  //     Authorization: `token ${token}`,
  //   };

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(`${this.githubApiUrl}/users/${username}`, {
  //         headers,
  //       }),
  //     );
  //     return response.data;
  //   } catch (error) {
  //     throw new HttpException(error.response.data, error.response.status);
  //   }
  // }

  // async searchUsers(query: string): Promise<any> {
  //   const token = this.configService.get<string>('GITHUB_TOKEN');
  //   const headers = {
  //     Authorization: `token ${token}`,
  //   };

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(`${this.githubApiUrl}/search/users`, {
  //         headers,
  //         params: { q: query },
  //       }),
  //     );
  //     return response.data.items;
  //   } catch (error) {
  //     throw new HttpException(error.response.data, error.response.status);
  //   }
  // }
}
