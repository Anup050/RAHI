.PHONY: up down build clean shell-backend shell-web

# Orchestration
up:
	docker-compose -f infrastructure/docker-compose.yml up -d

down:
	docker-compose -f infrastructure/docker-compose.yml down

build:
	docker-compose -f infrastructure/docker-compose.yml build

logs:
	docker-compose -f infrastructure/docker-compose.yml logs -f

# Cleaning
clean:
	docker-compose -f infrastructure/docker-compose.yml down -v
	rm -rf apps/web/.next apps/web/node_modules
	rm -rf apps/mobile/.expo apps/mobile/node_modules
	rm -rf services/api/__pycache__ services/api/venv
	rm -rf services/ai-engine/__pycache__

# Shell Access
shell-backend:
	docker-compose -f infrastructure/docker-compose.yml exec backend /bin/bash

shell-web:
	docker-compose -f infrastructure/docker-compose.yml exec web /bin/sh
