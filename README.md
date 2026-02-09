# ília NodeJS Challenge - Digital Wallet Microservices

A production-ready microservices implementation featuring secure user management and transaction processing. Built with NestJS, PostgreSQL, and Docker, demonstrating pragmatic architecture decisions that balance robustness with simplicity.

**Key Highlights:**
- Dual microservice architecture with separate databases
- Multi-tier rate limiting and comprehensive security headers
- Financial safety with idempotency keys and advisory locks
- Decimal precision for monetary amounts
- JWT authentication with internal/external separation
- Full Docker containerization with health checks

## Quick Start

**Prerequisites:** Node 18+, Docker, npm 9+

```bash
# Install dependencies
npm install

# Start databases and run migrations
make up && make migrate

# Start both services
make dev
```

Services will be available at:
- **ms-users**: http://localhost:3002
- **ms-transactions**: http://localhost:3001

For detailed setup instructions, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## Architecture

### Service Overview

| Service | Port | Database Port | Responsibility |
|---------|------|---------------|----------------|
| **ms-users** | 3002 | 5433 | User registration, authentication, wallet API facade |
| **ms-transactions** | 3001 | 5434 | Transaction processing, balance calculation, audit trail |

### Inter-Service Communication

- **Protocol**: RESTful HTTP
- **External Auth**: JWT with `ILIACHALLENGE` secret (user-facing endpoints)
- **Internal Auth**: JWT with `ILIACHALLENGE_INTERNAL` secret (service-to-service)
- **Security Boundary**: ms-users validates external requests, then calls ms-transactions with internal credentials
- **Data Flow**: Client → ms-users (validates) → ms-transactions (executes) → PostgreSQL

```
┌─────────┐         ┌──────────────┐         ┌──────────────────┐
│ Client  │────────▶│   ms-users   │────────▶│ ms-transactions  │
│         │  JWT    │  (port 3002) │ Internal│   (port 3001)   │
└─────────┘ External│              │   JWT   │                  │
                    │ ┌──────────┐ │         │ ┌──────────┐    │
                    │ │PostgreSQL│ │         │ │PostgreSQL│    │
                    │ │(port 5433)│ │         │ │(port 5434)│    │
                    │ └──────────┘ │         │ └──────────┘    │
                    └──────────────┘         └──────────────────┘
```

## Key Features

### Security

- **Helmet**: HTTP security headers (XSS, clickjacking, MIME sniffing protection)
- **Multi-Tier Rate Limiting**: 3 req/sec, 20 req/10sec, 100 req/min per endpoint
- **Argon2 Password Hashing**: Memory-hard algorithm resistant to GPU attacks
- **Dual JWT Authentication**: Separate tokens for external clients and internal services
- **Input Validation**: Class-validator with whitelist and sanitization
- **Ownership Validation**: Users can only access their own wallet data

### Financial Safety

- **Idempotency Keys**: Prevent duplicate transaction processing (enforced at database level)
- **PostgreSQL Advisory Locks**: Prevent concurrent balance modifications
- **Decimal Precision**: `Decimal(19,2)` for monetary amounts (no floating-point errors)
- **Balance Validation**: Reject debits that would create negative balances
- **Comprehensive Audit Logging**: Structured logs with user_id, transaction_id, amounts, timestamps

### Production Ready

- **Docker Containerization**: Separate dev (databases only) and prod (full stack) configs
- **Health Checks**: `/health` endpoints for all services
- **Database Migrations**: Prisma schema management with version control
- **Monorepo**: npm workspaces for shared tooling and dependencies
- **Environment-Based Configuration**: `.env` for dev, `.env.prod` for production
- **CI/CD**: GitHub Actions workflow with linting and testing

## API Overview

### Authentication (ms-users)

- `POST /users` - Create new user account (public endpoint)
- `POST /auth` - Login and obtain JWT access token

### Users (ms-users)

- `GET /users/me` - Get current authenticated user details
- `GET /users` - List all users
- `GET /users/:id` - Get specific user details
- `PATCH /users/:id` - Update user (ownership validated)
- `DELETE /users/:id` - Delete user (ownership validated)

### Wallet (ms-users → ms-transactions)

- `GET /users/:userId/wallet/balance` - Get current wallet balance
- `GET /users/:userId/wallet/transactions?type=CREDIT|DEBIT` - List transaction history (optional type filter)
- `POST /users/:userId/wallet/transactions` - Create transaction (credit or debit, requires idempotency key)

All wallet operations validate ownership (users can only access their own wallet), then ms-users proxies to ms-transactions with internal JWT.

## Design Decisions

### What I Built (Production Essentials)

**Security First**
- Implemented Helmet for standard HTTP security headers (prevents common web vulnerabilities)
- Multi-tier rate limiting protects against brute force and DoS attacks
- Argon2 password hashing is more secure than bcrypt for modern hardware
- Dual JWT layer ensures service-to-service calls cannot be forged by external clients

**Financial Integrity**
- Idempotency keys with unique database constraints prevent duplicate charges
- PostgreSQL advisory locks ensure atomic balance updates under concurrent load
- Decimal precision eliminates floating-point rounding errors (critical for money)
- Pre-debit balance validation prevents overdrafts

**Observability**
- Structured logging with consistent fields (user_id, transaction_id, amount, timestamp)
- Health check endpoints for monitoring and load balancer integration
- Transaction audit trail provides complete history for compliance

**Developer Experience**
- Makefile provides simple commands (`make dev`, `make test`)
- Docker configs eliminate "works on my machine" issues
- Environment variable separation keeps secrets safe
- Test suite with unit and e2e tests

### What I Intentionally Kept Simple (Avoiding Over-Engineering)

This project demonstrates awareness of enterprise patterns while maintaining pragmatic simplicity. Here's what I **didn't** implement and why:

#### 1. Message Queues (RabbitMQ/Kafka) - NOT USED

**Why:** Synchronous REST is sufficient for this scale. Transactions are simple request-response operations that don't need async processing.

**Trade-off:** Direct HTTP calls are easier to debug and trace. Every operation completes in the same request cycle, making errors immediately visible.

**When to add:** Processing >1000 transactions/second, need for retry mechanisms, or async workflows (emails, notifications, webhooks).

#### 2. API Gateway/Service Mesh (Kong/Istio) - NOT USED

**Why:** Two services don't justify gateway complexity. ms-users already acts as a facade for external requests.

**Trade-off:** Each service handles its own authentication, rate limiting, and validation. Simpler deployment with fewer moving parts.

**When to add:** 5+ microservices, centralized routing/logging needed, or complex traffic management (A/B testing, canary deployments).

#### 3. CQRS/Event Sourcing - NOT USED

**Why:** Simple CRUD operations don't need complex patterns. Balance is calculated by summing transactions, not replaying events.

**Trade-off:** Direct database queries are faster and easier to understand. No event store overhead or eventual consistency challenges.

**When to add:** Need to replay audit history, complex domain logic with multiple aggregate roots, or temporal queries ("what was the balance on Jan 1?").

#### 4. Redis Caching - NOT USED

**Why:** PostgreSQL performance is adequate for this scale. Database queries complete in <10ms even under load.

**Trade-off:** Every balance request hits the database. No cache invalidation complexity or stale data risks.

**When to add:** Balance queries exceed 100/sec, response times degrade >100ms, or read-heavy workload emerges.

#### 5. Distributed Tracing (OpenTelemetry/Jaeger) - NOT USED

**Why:** Two-service architecture with clear boundaries. Request flow is simple: client → ms-users → ms-transactions.

**Trade-off:** Structured logging provides sufficient context (correlation IDs in logs). No distributed tracing infrastructure to maintain.

**When to add:** Service count grows beyond 3-4, complex debugging needed across many hops, or performance profiling required.

#### 6. gRPC Instead of REST - NOT USED

**Why:** REST is more accessible and easier to test with standard tools (curl, Postman, Swagger).

**Trade-off:** Slightly higher latency (~5-10ms per request). JSON serialization is heavier than Protocol Buffers.

**When to add:** Need sub-millisecond latency, high-frequency calls (>10k/sec), or strong typing contracts between services.

#### 7. Distributed Rate Limiting (Redis) - NOT USED

**Why:** Single-instance in-memory rate limiting is adequate for development and small deployments.

**Trade-off:** Rate limits are per-instance. Running 3 replicas means effective limit is 3x the configured value.

**When to add:** Running multiple service replicas in production behind a load balancer.

#### 8. OAuth2/OIDC (Keycloak/Auth0) - NOT USED

**Why:** Challenge specified simple JWT authentication. No need for third-party identity providers.

**Trade-off:** No single sign-on, social login, or scope-based permissions. Custom user management required.

**When to add:** External identity providers needed, enterprise SSO integration, or complex authorization rules.

#### 9. Saga Pattern for Distributed Transactions - NOT USED

**Why:** Transactions are fully contained within ms-transactions service. No operations span multiple databases.

**Trade-off:** No cross-service rollback mechanism (not needed because each operation is atomic within one database).

**When to add:** Operations span multiple services requiring coordinated rollback (e.g., book flight + charge card + send email).

### The Balance - Pragmatic Production-Ready

This architecture follows the **80/20 rule**: 80% of production safety with 20% of enterprise complexity.

- **Core security** without excessive infrastructure (no service mesh, no OAuth provider)
- **Financial integrity** without event sourcing (idempotency + locks are sufficient)
- **Sufficient observability** without distributed tracing (structured logs tell the story)
- **Simple deployment** without orchestration complexity (Docker Compose is enough)

**Perfect for:**
- Technical assessment submissions and coding challenges
- MVP/proof-of-concept projects for startups
- Early-stage products (< 1000 active users)
- Learning microservices patterns without overwhelming complexity

**Scale limits (honest assessment):**
- ~100 concurrent users
- ~50 transactions/second
- Single-region deployment
- Development/staging environments

**When to graduate to enterprise patterns:** User count exceeds 1000, transaction volume hits 100/sec consistently, or deployment spans multiple regions/availability zones.

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed instructions including:
- Environment setup and configuration
- Database management and migrations
- Testing and debugging
- Production deployment

**Quick commands:**
```bash
make test       # Run all tests (unit + e2e)
make lint       # Run ESLint across all packages
make logs       # View Docker container logs
make clean      # Remove all containers and volumes
```

## Technology Stack

- **Backend Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: JWT with passport-jwt
- **Security**: Helmet (HTTP headers), @nestjs/throttler (rate limiting), Argon2 (password hashing)
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest (unit + e2e)
- **Monorepo**: npm workspaces
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## Environment Variables

### Development
Services use `.env` files with challenge-specified secrets:

```env
# packages/ms-users/.env
JWT_SECRET=ILIACHALLENGE
JWT_INTERNAL_SECRET=ILIACHALLENGE_INTERNAL
DATABASE_URL=postgresql://user:pass@localhost:5433/users

# packages/ms-transactions/.env
JWT_SECRET=ILIACHALLENGE_INTERNAL
DATABASE_URL=postgresql://user:pass@localhost:5434/transactions
```

### Production
Copy `.env.prod.example` to `.env.prod` and generate secure secrets:

```bash
openssl rand -base64 32  # Generate strong JWT secrets
```

**NEVER** commit `.env.prod` to version control.