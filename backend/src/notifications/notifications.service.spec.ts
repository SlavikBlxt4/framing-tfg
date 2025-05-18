import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsGateway } from './notification.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<Repository<Notification>>;
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepo,
        },
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(getRepositoryToken(Notification));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new notification', async () => {
    const userId = 21;
    const title = 'Título';
    const message = 'Mensaje';
    const type = 'SESSION_UPDATED';

    const notificationMock = { id: 1, title, message, type };
    repo.create.mockReturnValue(notificationMock as any);
    repo.save.mockResolvedValue(notificationMock as any);

    const result = await service.create(
      userId.toString(),
      title,
      message,
      type,
    );

    expect(repo.create).toHaveBeenCalledWith({
      user: { id: userId },
      title,
      message,
      type,
    });
    expect(repo.save).toHaveBeenCalledWith(notificationMock);
    expect(mockGateway.sendNotification).toHaveBeenCalledWith(
      userId,
      notificationMock,
    );
    expect(result).toEqual(notificationMock);
  });

  it('should fetch all notifications for a user', async () => {
    const userId = '21';
    const notifications = [{ id: 1 }, { id: 2 }] as Notification[];

    repo.find.mockResolvedValue(notifications);

    const result = await service.getUserNotifications(userId);

    expect(repo.find).toHaveBeenCalledWith({
      where: { user: { id: Number(userId) } },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(notifications);
  });

  it('should mark a notification as read', async () => {
    await service.markAsRead(1);
    expect(repo.update).toHaveBeenCalledWith(1, { read: true });
  });
});
