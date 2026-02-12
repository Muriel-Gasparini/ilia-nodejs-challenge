.PHONY: help setup dev dev-frontend up down prod prod-down logs install migrate test clean db-reset

help:
	@echo "Available commands:"
	@echo ""
	@echo "  make setup        - First-time setup (install, envs, DBs, migrations)"
	@echo "  make dev          - Start all services in dev mode"
	@echo ""
	@echo "  make install      - Install all dependencies"
	@echo "  make up           - Start databases (development)"
	@echo "  make dev-frontend - Start frontend only"
	@echo "  make down         - Stop databases"
	@echo "  make migrate      - Run database migrations"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Run linters"
	@echo "  make prod         - Start production (full Docker)"
	@echo "  make prod-down    - Stop production"
	@echo "  make logs         - View docker logs"
	@echo "  make db-reset     - Wipe database data and re-run migrations"
	@echo "  make clean        - Remove all containers and volumes"

setup:
	@echo "Installing dependencies..."
	npm install
	@echo "Setting up environment files..."
	@[ -f packages/ms-users/.env ] || cp packages/ms-users/.env.example packages/ms-users/.env
	@[ -f packages/ms-transactions/.env ] || cp packages/ms-transactions/.env.example packages/ms-transactions/.env
	@[ -f packages/frontend/.env ] || cp packages/frontend/.env.example packages/frontend/.env
	@echo "Starting databases..."
	docker compose up -d
	@echo "Waiting for databases..."
	@sleep 5
	@echo "Running migrations..."
	npm run db:migrate
	@echo ""
	@echo "Setup complete! Run 'make dev' to start developing."

install:
	npm install

up:
	docker compose up -d
	@sleep 3

dev: up
	npm run db:generate
	npm run dev

dev-frontend:
	npm run dev:frontend

down:
	docker compose down

migrate: up
	npm run db:migrate

test:
	npm test

lint:
	npm run lint

prod:
	@if [ ! -f .env.prod ]; then \
		echo "Error: .env.prod not found!"; \
		echo "Copy .env.prod.example to .env.prod and fill with real secrets"; \
		exit 1; \
	fi
	docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

prod-down:
	@if [ -f .env.prod ]; then \
		docker compose -f docker-compose.prod.yml --env-file .env.prod down; \
	else \
		docker compose -f docker-compose.prod.yml down; \
	fi

logs:
	docker compose logs -f

db-reset:
	docker compose down -v
	@$(MAKE) migrate

clean:
	docker compose down -v
	docker compose -f docker-compose.prod.yml down -v
	rm -rf packages/*/node_modules node_modules
