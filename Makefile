.PHONY: help dev dev-frontend up down prod prod-down logs install migrate test clean

help:
	@echo "Available commands:"
	@echo "  make install      - Install all dependencies"
	@echo "  make up           - Start databases (development)"
	@echo "  make dev          - Start all services in dev mode"
	@echo "  make dev-frontend - Start frontend only"
	@echo "  make down         - Stop databases"
	@echo "  make migrate      - Run database migrations"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Run linters"
	@echo "  make prod         - Start production (full Docker)"
	@echo "  make prod-down    - Stop production"
	@echo "  make logs         - View docker logs"
	@echo "  make clean        - Remove all containers and volumes"

install:
	npm install

up:
	docker compose up -d
	@sleep 3

dev: up
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

clean:
	docker compose down -v
	docker compose -f docker-compose.prod.yml down -v
	rm -rf packages/*/node_modules node_modules
