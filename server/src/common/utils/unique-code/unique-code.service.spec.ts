import { Test, TestingModule } from '@nestjs/testing';
import { UniqueCodeService } from './unique-code.service';

describe('UniqueCodeService', () => {
  let service: UniqueCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniqueCodeService],
    }).compile();

    service = module.get<UniqueCodeService>(UniqueCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
