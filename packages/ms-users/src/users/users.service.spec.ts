import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;

  const mockTx = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: typeof mockTx) => Promise<unknown>) =>
      fn(mockTx),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      const createUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const expectedUser = {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          updated_at: true,
          password: false,
        },
      });
      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return one user without password', async () => {
      const userId = '123';
      const expectedUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          updated_at: true,
          password: false,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw ForbiddenException when requesting another user profile', async () => {
      const userId = '123';
      const requestingUserId = '456';

      await expect(service.findOne(userId, requestingUserId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.user.findUniqueOrThrow).not.toHaveBeenCalled();
    });

    it('should allow viewing own profile', async () => {
      const userId = '123';
      const expectedUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId, userId);

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update user and hash password if provided', async () => {
      const userId = '123';
      const updateUserDto = {
        first_name: 'Jane',
        password: 'newpassword123',
      };

      const hashedPassword = 'hashed_new_password';
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const expectedUser = {
        id: userId,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockTx.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto);

      expect(argon2.hash).toHaveBeenCalledWith('newpassword123');
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          first_name: 'Jane',
          password: hashedPassword,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          updated_at: true,
          password: false,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should update user without hashing if password not provided', async () => {
      const userId = '123';
      const updateUserDto = {
        first_name: 'Jane',
      };

      const expectedUser = {
        id: userId,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockTx.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto);

      expect(argon2.hash).not.toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw ConflictException if email already exists for another user', async () => {
      const userId = '123';
      const updateUserDto = {
        email: 'another@example.com',
      };

      mockTx.user.findUnique.mockResolvedValue({
        id: 'different-id',
        email: 'another@example.com',
      });

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should allow updating email to same email', async () => {
      const userId = '123';
      const updateUserDto = {
        email: 'john@example.com',
      };

      const expectedUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockTx.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'john@example.com',
      });
      mockTx.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(expectedUser);
    });

    it('should throw ForbiddenException when updating another user profile', async () => {
      const userId = '123';
      const requestingUserId = '456';
      const updateUserDto = { first_name: 'Jane' };

      await expect(
        service.update(userId, updateUserDto, requestingUserId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockTx.user.update).not.toHaveBeenCalled();
    });

    it('should allow updating own profile', async () => {
      const userId = '123';
      const updateUserDto = { first_name: 'Jane' };
      const expectedUser = {
        id: userId,
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockTx.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto, userId);

      expect(mockTx.user.update).toHaveBeenCalled();
      expect(result.first_name).toBe('Jane');
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      const userId = '123';
      const deletedUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'hashed',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.user.delete.mockResolvedValue(deletedUser);

      const result = await service.remove(userId);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(deletedUser);
    });

    it('should throw ForbiddenException when deleting another user account', async () => {
      const userId = '123';
      const requestingUserId = '456';

      await expect(service.remove(userId, requestingUserId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });

    it('should allow deleting own account', async () => {
      const userId = '123';
      const deletedUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'hashed',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.user.delete.mockResolvedValue(deletedUser);

      const result = await service.remove(userId, userId);

      expect(mockPrismaService.user.delete).toHaveBeenCalled();
      expect(result).toEqual(deletedUser);
    });
  });
});
