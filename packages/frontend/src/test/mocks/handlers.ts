import { http, HttpResponse } from 'msw';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const mockBalance = {
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  balance: 1500.5,
};

const mockTransactions = [
  {
    id: '1',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    amount: 1000.0,
    type: 'CREDIT',
    idempotency_key: 'key-1',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z',
  },
  {
    id: '2',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    amount: 500.5,
    type: 'CREDIT',
    idempotency_key: 'key-2',
    created_at: '2024-01-16T12:00:00.000Z',
    updated_at: '2024-01-16T12:00:00.000Z',
  },
  {
    id: '3',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    amount: 200.0,
    type: 'DEBIT',
    idempotency_key: 'key-3',
    created_at: '2024-01-17T14:00:00.000Z',
    updated_at: '2024-01-17T14:00:00.000Z',
  },
];

export const handlers = [
  http.post('/api/auth', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'john@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: mockUser,
        access_token: 'mock-jwt-token',
      });
    }
    return HttpResponse.json({ statusCode: 401, message: 'Unauthorized' }, { status: 401 });
  }),

  http.post('/api/users', async () => {
    return HttpResponse.json(mockUser, { status: 201 });
  }),

  http.get('/api/users/me', () => {
    return HttpResponse.json(mockUser);
  }),

  http.patch('/api/users/:id', async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    return HttpResponse.json({ ...mockUser, ...body });
  }),

  http.get('/api/users/:userId/wallet/balance', () => {
    return HttpResponse.json(mockBalance);
  }),

  http.get('/api/users/:userId/wallet/transactions', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const filtered = type ? mockTransactions.filter((t) => t.type === type) : mockTransactions;
    return HttpResponse.json({
      data: filtered,
      meta: { total: filtered.length, page, limit, totalPages: 1 },
    });
  }),

  http.post('/api/users/:userId/wallet/transactions', async () => {
    return HttpResponse.json(
      {
        id: '4',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.0,
        type: 'CREDIT',
        idempotency_key: 'key-4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
