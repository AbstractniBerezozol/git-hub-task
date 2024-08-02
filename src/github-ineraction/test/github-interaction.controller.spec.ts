import { Test, TestingModule } from '@nestjs/testing';
import { GithubInteractionController } from '../../src/controller/github-interaction.controller';

describe('GithubInteractionController', () => {
  let controller: GithubInteractionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubInteractionController],
    }).compile();

    controller = module.get<GithubInteractionController>(
      GithubInteractionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
