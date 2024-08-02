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
import { GithubIneractionService } from '../service/github-ineraction.service';
import { query } from 'express';
import { Repository } from 'typeorm';

import { SearchBy } from '../domain/enum/repository.enum';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { GitRepository } from '../domain/entity/repository.entity';

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

  @Get('sendTestEmail')
  async sendEmail(@Query('email') email: string) {
    email = 'aleksandr.zolotarev@abstract.rs';
    return this.githubService.testEmailing(email);
  }
}
