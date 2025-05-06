import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { Repository } from 'typeorm';

describe('LocationsService', () => {
  let service: LocationsService;
  let repo: Repository<Location>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    repo = module.get<Repository<Location>>(getRepositoryToken(Location));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array', async () => {
    const result = await service.getAllLocations();
    expect(result).toEqual([]);
    expect(repo.find).toHaveBeenCalled();
  });
});
