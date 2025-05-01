import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUsersService = {
    signup: jest.fn(),
    login: jest.fn(),
    findById: jest.fn(),
    getServicesByPhotographerId: jest.fn(),
    getTop10PhotographersByBookings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call usersService.signup and return the user', async () => {
      const dto = {
        name: 'Laura',
        email: 'laura@example.com',
        password: 'abc123',
        phone_number: '600123456',
        role: UserRole.CLIENT,
      };
      const expectedUser = { id: 1, ...dto };
      usersService.signup.mockResolvedValue(expectedUser as any);

      const result = await controller.signup(dto);
      expect(usersService.signup).toHaveBeenCalledWith(
        dto.name,
        dto.email,
        dto.password,
        dto.phone_number,
        dto.role,
      );
      expect(result).toEqual(expectedUser);
    });
  });

  describe('login', () => {
    it('should call usersService.login and return a token', async () => {
      const dto = {
        email: 'laura@example.com',
        password: 'abc123',
      };
      usersService.login.mockResolvedValue('fake-token');

      const result = await controller.login(dto);
      expect(usersService.login).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(result).toBe('fake-token');
    });
  });

  describe('getMyServices', () => {
    jest.clearAllMocks();
    it('should return services if role is PHOTOGRAPHER', async () => {
      const req = {
        user: {
          userId: 1,
          role: UserRole.PHOTOGRAPHER,
        },
      } as any;

      const services = [
        {
          id: 1,
          name: 'Sesión retrato',
          description: 'Descripción',
          price: 100,
          imageUrl: 'img.jpg',
          category: { name: 'Retrato' },
        },
      ];
      usersService.getServicesByPhotographerId.mockResolvedValue(
        services as any,
      );

      const result = await controller.getMyServices(req);
      expect(usersService.getServicesByPhotographerId).toHaveBeenCalledWith(1);
      expect(result).toEqual([
        {
          id: 1,
          name: 'Sesión retrato',
          description: 'Descripción',
          price: 100,
          imageUrl: 'img.jpg',
          categoryName: 'Retrato',
        },
      ]);
    });

    it('should throw ForbiddenException if user is not a photographer', async () => {
      const req = {
        user: {
          userId: 1,
          role: UserRole.CLIENT,
        },
      } as any;

      await expect(controller.getMyServices(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getTop10Photographers', () => {
    it('should return result from usersService.getTop10PhotographersByBookings', async () => {
      const top = [
        { photographer_id: 1, photographer_name: 'Ana', booking_count: 12 },
      ];
      usersService.getTop10PhotographersByBookings.mockResolvedValue(top);

      const result = await controller.getTop10Photographers();
      expect(result).toEqual(top);
      expect(usersService.getTop10PhotographersByBookings).toHaveBeenCalled();
    });
  });
});
