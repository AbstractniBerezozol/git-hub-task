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
import { SearchBy } from './github-interaction/repository/repository.enum';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('github-interaction')
@Controller('github-interaction')
export class GithubInteractionController {
  constructor(private readonly githubService: GithubIneractionService) {}

  @Get('search/repos/:value')
  async searchRepositories(
    @Query('searchBy') searchBy: SearchBy,
    @Param('value') value: string,
    @Query('owner') owner: string,
  ) {
    console.log(value);
    console.log(searchBy);
    console.log(owner);
    return this.githubService.searchRepositories(searchBy, value, owner);
  }

  @Post('add-repository/:repoId')
  async addRepositoryToWatchlist(
    @Param('repoId') repoId: number,
    @Body('username') username: string,
  ) {
    console.log('Here');
    const user = await this.githubService.getUser(username);
    return this.githubService.addRepository(repoId, user);
  }

  @Delete('delete-repository/:repoId')
  async deleteRepository(
    @Param('repoId') repoId: number,
    @Body('username') username: string,
  ) {
    const user = await this.githubService.getUser(username);
    return this.githubService.deleteRepository(repoId);
  }
  @Get('watchlist')
  async getWatchlist(@Request() req): Promise<GitRepository[]> {
    return this.githubService.getWatchlist(req.user);
  }

  @Get('sendEmail')
  async sendEmail(@Param('email') email: string) {
    email = 'alexander.i.zolotaryev@gmail.com';
    console.log(email);
    return this.githubService.testEmailing(email);
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
