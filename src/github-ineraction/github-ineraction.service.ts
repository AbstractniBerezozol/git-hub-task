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

@Injectable()
export class GithubIneractionService {
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
  async searchRepositories(searchBy: SearchBy, name: string): Promise<any> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const headers = {
      Authorization: `token ${token}`,
    };

    try {
      const result = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/search/repositories`, {
          headers,
          params: { q: `${name} ${searchBy}` },
        }),
      );

      return result.data;
    } catch (error) {
      console.log('I am here');
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async addRepository(repoId: number, user: User): Promise<GitRepository> {
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
        user,
      });
      return this.gitRepository.save(newRepo);
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async deleteRepository(repoId: number, user: User): Promise<void> {
    const repository = await this.gitRepository.findOne({
      where: { user, repoId },
    });
    if (!repository) {
      throw new HttpException('not found', 404);
    }
    await this.gitRepository.remove(repository);
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
