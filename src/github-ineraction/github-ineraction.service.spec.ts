import { Test, TestingModule } from '@nestjs/testing';
import { GithubIneractionService } from './github-ineraction.service';

describe('GithubIneractionService', () => {
  let service: GithubIneractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubIneractionService],
    }).compile();

    service = module.get<GithubIneractionService>(GithubIneractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
