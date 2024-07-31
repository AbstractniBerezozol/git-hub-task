import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GithubIneractionService } from './github-ineraction.service';

@Injectable()
export class GitHubScheduler {
  constructor(private readonly githubService: GithubIneractionService) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    await this.githubService.checkForUpdates();
  }

  @Cron('0 0 1 * *')
  async handleMonthSummary() {
    await this.githubService.sendMonthSummary();
  }
}
