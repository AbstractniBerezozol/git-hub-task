import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { GithubIneractionService } from './github-ineraction.service';
import { query } from 'express';
import { Repository } from 'typeorm';
import { GitRepository } from './github-interaction/repository/repository.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('github-interaction')
export class GithubInteractionController {
  constructor(private readonly githubService: GithubIneractionService) {}

  @Get('user/:username')
  async getUser(@Param('username') username: string) {
    return this.githubService.getUser(username);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    return this.githubService.searchUsers(query);
  }

  @Get('search/repositories')
  async searchRepositories(@Param('q') query: string) {
    return this.githubService.searchRepositories(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('repos/')
  async addToWatchlist(
    @Request()
    req,
  ): Promise<GitRepository> {
    return this.githubService.addRepository(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('watchlist')
  async getWatchlist(@Request() req): Promise<GitRepository[]> {
    return this.githubService.getWatchlist(req.user);
  }
}
