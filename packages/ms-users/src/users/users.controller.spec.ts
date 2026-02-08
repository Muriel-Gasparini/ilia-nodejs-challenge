import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const currentUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john@example.com',
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
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(currentUser);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(currentUser.userId);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should delegate to service with authorization', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(currentUser.userId, currentUser);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(
        currentUser.userId,
        currentUser.userId,
      );
    });
  });

  describe('update', () => {
    it('should delegate to service with authorization', async () => {
      const updateUserDto: UpdateUserDto = {
        first_name: 'Jane',
      };

      const updatedUser = { ...mockUser, first_name: 'Jane' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        currentUser.userId,
        updateUserDto,
        currentUser,
      );

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(
        currentUser.userId,
        updateUserDto,
        currentUser.userId,
      );
    });
  });

  describe('remove', () => {
    it('should delegate to service with authorization', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(currentUser.userId, currentUser);

      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith(
        currentUser.userId,
        currentUser.userId,
      );
    });
  });
});
