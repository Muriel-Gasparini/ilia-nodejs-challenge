import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { TransactionRequestDto } from './dto/transaction-request.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Injectable()
export class TransactionsClientService {
  private readonly logger = new Logger(TransactionsClientService.name);
  private readonly msTransactionsUrl: string;
  private readonly jwtInternalSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {
    this.msTransactionsUrl =
      process.env.MS_TRANSACTIONS_URL || 'http://localhost:3001';
    this.jwtInternalSecret =
      process.env.JWT_INTERNAL_SECRET || 'ILIACHALLENGE_INTERNAL';
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
  ): Promise<TransactionResponseDto[]> {
    try {
      this.logger.log(`Fetching transactions for user ${userId}`);
      const response = await firstValueFrom(
        this.httpService.get<TransactionResponseDto[]>(
          `${this.msTransactionsUrl}/transactions`,
          {
            headers: this.getAuthHeaders(),
            params: { user_id: userId, ...(type && { type }) },
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
        throw new ServiceUnavailableException(
          'MS-Transactions service is unavailable',
        );
      }

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        if (status >= 400 && status < 500) {
          throw new InternalServerErrorException(
            `MS-Transactions returned error: ${message}`,
          );
        }

        if (status >= 500) {
          throw new ServiceUnavailableException(
            'MS-Transactions service error',
          );
        }
      }
    }

    throw new InternalServerErrorException(
      'Unexpected error communicating with MS-Transactions',
    );
  }
}
