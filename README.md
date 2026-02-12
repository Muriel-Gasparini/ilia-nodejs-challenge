# Upília — Digital Wallet Microservices

Two-service digital wallet built with NestJS, PostgreSQL, and Docker.

## Prerequisites

- **Docker** and **Docker Compose**
- **Make**

| OS | Notes |
|----|-------|
| Linux | Native — primary development platform |
| macOS | Docker Desktop + Xcode CLI tools (`make` included) |
| Windows | Docker Desktop + WSL2 (recommended), or `make` via Chocolatey/GnuWin |

## Quick Start

```bash
make setup   # install deps, create .env files, start DBs, run migrations
make dev     # start all services in dev mode
```

That's it. Frontend at http://localhost:5173, APIs at `:3002` and `:3001`.

## Production

```bash
cp .env.prod.example .env.prod   # configure real secrets
make prod                        # build and start full Docker stack
```

## Commands

| Command | Description |
|---------|-------------|
| `make setup` | First-time setup (install, envs, DBs, migrations) |
| `make dev` | Start all services in dev mode |
| `make dev-frontend` | Start frontend only |
| `make up` / `make down` | Start / stop databases |
| `make migrate` | Run database migrations |
| `make test` | Run all tests |
| `make lint` | Run linters |
| `make prod` / `make prod-down` | Start / stop production |
| `make logs` | View Docker logs |
| `make db-reset` | Wipe databases and re-run migrations |
| `make clean` | Remove all containers and volumes |

## Services & Ports

| Service | Dev Port | Prod Port |
|---------|----------|-----------|
| Frontend | 5173 | 80 |
| ms-users | 3002 | 3002 |
| ms-transactions | 3001 | 3001 |
| DB (users) | 5433 | — |
| DB (transactions) | 5434 | — |

## Tech Stack

- **NestJS** (TypeScript) — backend framework
- **PostgreSQL 15** + **Prisma** — database and ORM
- **Docker** + **Docker Compose** — containerization
- **JWT** — dual-layer auth (external + internal service-to-service)
- **React** + **Vite** + **Tailwind** — frontend

## Environment Variables

Each service has a `.env.example` file — `make setup` copies them automatically.

For production, copy `.env.prod.example` to `.env.prod` and set real secrets. **Never** commit `.env.prod`.
