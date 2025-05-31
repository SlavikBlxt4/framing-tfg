import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './user.entity';
import { Service } from '../services/service.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Category } from 'src/categories/category.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;
  let serviceRepo: jest.Mocked<Repository<Service>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Service),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    serviceRepo = module.get(getRepositoryToken(Service));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('signup', () => {
    it('should throw if email already exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as User);
      await expect(
        usersService.signup(
          'Laura',
          'laura@example.com',
          'pass',
          '600123456',
          UserRole.CLIENT,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should hash password and save new user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const saveMock = { id: 1, email: 'test@test.com' } as User;
      userRepo.create.mockReturnValue(saveMock);
      userRepo.save.mockResolvedValue(saveMock);

      const result = await usersService.signup(
        'Laura',
        'laura@example.com',
        'pass12345',
        '600123456',
        UserRole.CLIENT,
      );

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'laura@example.com' }),
      );
      expect(userRepo.save).toHaveBeenCalledWith(saveMock);
      expect(result).toEqual(saveMock);
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(usersService.login('x@x.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password does not match', async () => {
      userRepo.findOne.mockResolvedValue({
        email: 'x@x.com',
        password_hash: await bcrypt.hash('otherpass', 10),
      } as User);

      await expect(usersService.login('x@x.com', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a token if credentials are valid', async () => {
      const hash = await bcrypt.hash('validpass', 10);
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'x@x.com',
        password_hash: hash,
        role: UserRole.CLIENT,
      } as User);

      jwtService.sign.mockReturnValue('fake-jwt-token');

      const token = await usersService.login('x@x.com', 'validpass');

      expect(token).toBe('fake-jwt-token');
    });
  });

  describe('getServicesByPhotographerId', () => {
    it('should return services from query builder', async () => {
      const getMany = jest
        .fn()
        .mockResolvedValue([{ id: 1, name: 'Test Service' }]);
      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany,
      };
      serviceRepo.createQueryBuilder.mockReturnValue(mockQB as any);

      const result = await usersService.getServicesByPhotographerId(1);
      expect(result).toEqual([{ id: 1, name: 'Test Service' }]);
      expect(getMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user by ID', async () => {
      const mockUser = { id: 1, name: 'Diego' } as User;
      userRepo.findOne.mockResolvedValue(mockUser);
      const result = await usersService.findById(1);
      expect(result).toBe(mockUser);
    });
  });

  describe('getTop10PhotographersByBookings', () => {
    it('should execute raw SQL query', async () => {
      const expected = [
        { photographer_id: 1, photographer_name: 'Ana', booking_count: 12 },
      ];
      userRepo.query.mockResolvedValue(expected);
      const result = await usersService.getTop10PhotographersByBookings();
      expect(result).toEqual(expected);
    });
  });
});
