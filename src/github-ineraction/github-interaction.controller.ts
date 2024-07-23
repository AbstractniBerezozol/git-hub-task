import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Post,
  Delete,
  Body,
} from '@nestjs/common';
import { GithubIneractionService } from './github-ineraction.service';
import { query } from 'express';
import { Repository } from 'typeorm';
import { GitRepository } from './github-interaction/repository/repository.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SearchBy } from './github-interaction/repository/repository.enum';

@UseGuards(JwtAuthGuard)
@Controller('github-interaction')
export class GithubInteractionController {
  constructor(private readonly githubService: GithubIneractionService) {}

  @Get('search/repositories/:value')
  async searchRepositories(@Param('value') value: string, searchBy: SearchBy) {
    return this.githubService.searchRepositories(value, searchBy);
  }

  @Post('add-repository/:repoId')
  async addRepositoryToWatchlist(@Param('repoId') repoId: number, @Body('username') username: string) {
    const user = await this.githubService.getUser(username);
    return this.githubService.addRepository(repoId, user);
  }

  @Delete('delete-repository')
  async deleteRepository(
    @Param('repoId') repoId: number,
    @Body('username') username: string,
  ) {
    const user = await this.githubService.getUser(username);
    return this.githubService.deleteRepository(repoId, user);
  }
  @Get('watchlist')
  async getWatchlist(@Request() req): Promise<GitRepository[]> {
    return this.githubService.getWatchlist(req.user);
  }
  // @Get('user/:username')
  // async getUser(@Param('username') username: string) {
  //   return this.githubService.getUser(username);
  // }

  // @Get('search')
  // async searchUsers(@Query('q') query: string) {
  //   return this.githubService.searchUsers(query);
  // }
}
