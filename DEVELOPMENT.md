# Development Guide

## Quick Start

```bash
# Install
npm install

# Start databases
make up          # or: docker compose up -d

# Run migrations
make migrate     # or: npm run db:migrate

# Start services (separate terminals)
npm run dev:users
npm run dev:transactions

# Or both together
make dev         # or: npm run dev
```

## Environment Setup

Copy `.env.example` to `.env` in each microservice:

```bash
cp packages/ms-users/.env.example packages/ms-users/.env
cp packages/ms-transactions/.env.example packages/ms-transactions/.env
```

## Commands

### Development
```bash
make up          # Start databases
make dev         # Start databases + services
make down        # Stop databases
make logs        # View logs
```

### Database
```bash
make migrate     # Run migrations
npm run prisma:studio --workspace=ms-users        # Prisma Studio
npm run prisma:studio --workspace=ms-transactions
```

### Testing
```bash
make test        # All tests
make lint        # Run linters
```

### Production
```bash
# Setup production secrets first
cp .env.prod.example .env.prod
# Edit .env.prod with real secrets (NEVER commit this file!)

make prod        # Build and start full stack
make prod-down   # Stop production
```

### Cleanup
```bash
make clean       # Remove containers and volumes
```

## Services

- **ms-users**: http://localhost:3002
- **ms-transactions**: http://localhost:3001
- **DB users**: localhost:5433
- **DB transactions**: localhost:5434

## Files

```
docker-compose.yml      # Development (databases only)
docker-compose.prod.yml # Production (full stack)
Makefile                # Quick commands
```
