import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password);

    return await this.prisma.user.create({
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
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }

  async findOne(id: string, requestingUserId?: string) {
    if (requestingUserId && id !== requestingUserId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You can only view your own profile',
      });
    }

    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
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
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUserId?: string,
  ) {
    if (requestingUserId && id !== requestingUserId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You can only update your own profile',
      });
    }

    const data = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await argon2.hash(updateUserDto.password);
    }

    return this.prisma.$transaction(async (tx) => {
      if (updateUserDto.email) {
        const existing = await tx.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException({
            code: 'EMAIL_EXISTS',
            message: 'Email already exists',
          });
        }
      }

      return tx.user.update({
        where: { id },
        data,
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
    });
  }

  async remove(id: string, requestingUserId?: string) {
    if (requestingUserId && id !== requestingUserId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You can only delete your own account',
      });
    }

    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
