import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  HttpException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { TransactionRequestDto } from './dto/transaction-request.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import {
  TransactionResponseDto,
  PaginatedTransactionsResponse,
} from './dto/transaction-response.dto';

@Injectable()
export class TransactionsClientService {
  private readonly logger = new Logger(TransactionsClientService.name);
  private readonly msTransactionsUrl: string;
  private readonly jwtInternalSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.msTransactionsUrl = config.getOrThrow('MS_TRANSACTIONS_URL');
    this.jwtInternalSecret = config.getOrThrow('JWT_INTERNAL_SECRET');
  }

  private generateInternalToken(): string {
    return this.jwtService.sign(
      { sub: 'ms-users', service: 'ms-users' },
      { secret: this.jwtInternalSecret, expiresIn: '5m' },
    );
  }

  private getAuthHeaders(): { Authorization: string } {
    const token = this.generateInternalToken();
    return { Authorization: `Bearer ${token}` };
  }

  async getBalance(userId: string): Promise<BalanceResponseDto> {
    try {
      this.logger.log(`Fetching balance for user ${userId}`);
      const response = await firstValueFrom(
        this.httpService.get<BalanceResponseDto>(
          `${this.msTransactionsUrl}/balance`,
          {
            headers: this.getAuthHeaders(),
            params: { user_id: userId },
            timeout: 5000,
          },
        ),
      );
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getBalance');
    }
  }

  async getTransactions(
    userId: string,
    type?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedTransactionsResponse> {
    try {
      this.logger.log(`Fetching transactions for user ${userId}`);
      const response = await firstValueFrom(
        this.httpService.get<PaginatedTransactionsResponse>(
          `${this.msTransactionsUrl}/transactions`,
          {
            headers: this.getAuthHeaders(),
            params: {
              user_id: userId,
              ...(type && { type }),
              page,
              limit,
            },
            timeout: 5000,
          },
        ),
      );
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getTransactions');
    }
  }

  async createTransaction(
    data: TransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    try {
      this.logger.log(`Creating transaction for user ${data.user_id}`);
      const response = await firstValueFrom(
        this.httpService.post<TransactionResponseDto>(
          `${this.msTransactionsUrl}/transactions`,
          data,
          {
            headers: this.getAuthHeaders(),
            timeout: 5000,
          },
        ),
      );
      return response.data;
    } catch (error) {
      return this.handleError(error, 'createTransaction');
    }
  }

  private handleError(error: unknown, operation: string): never {
    this.logger.error(`Error in ${operation}: ${error}`);

    if (error instanceof AxiosError) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new ServiceUnavailableException({
          code: 'SERVICE_UNAVAILABLE',
          message: 'Transaction service is unavailable',
        });
      }

      if (error.response) {
        const { status, data } = error.response;
        const code = data?.code || 'INTERNAL_ERROR';
        const message = data?.message || error.message;

        if (status === 400) throw new BadRequestException({ code, message });
        if (status === 401) throw new UnauthorizedException({ code, message });
        if (status === 403) throw new ForbiddenException({ code, message });
        if (status === 404) throw new NotFoundException({ code, message });
        if (status === 409) throw new ConflictException({ code, message });
        if (status === 429)
          throw new HttpException({ code: 'RATE_LIMITED', message }, 429);

        if (status >= 500) {
          throw new ServiceUnavailableException({
            code: 'SERVICE_UNAVAILABLE',
            message: 'Transaction service error',
          });
        }
      }
    }

    throw new InternalServerErrorException({
      code: 'INTERNAL_ERROR',
      message: 'Unexpected error',
    });
  }
}
