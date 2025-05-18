import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  const mockService = {
    getUserNotifications: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return notifications for the user', async () => {
    const req = { user: { userId: '21' } } as any;
    const mockNotifications = [{ id: 1 }, { id: 2 }];
    mockService.getUserNotifications.mockResolvedValue(
      mockNotifications as any,
    );

    const result = await controller.getMyNotifications(req);
    expect(service.getUserNotifications).toHaveBeenCalledWith('21');
    expect(result).toEqual(mockNotifications);
  });

  it('should mark a notification as read', async () => {
    await controller.markAsRead('42');
    expect(service.markAsRead).toHaveBeenCalledWith(42);
  });
});
