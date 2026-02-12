export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}

export interface BalanceResponse {
  user_id: string;
  balance: number;
}

export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  amount: number;
  type: TransactionType;
  idempotency_key: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
