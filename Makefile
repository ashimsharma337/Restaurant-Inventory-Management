# Variables
COMPOSE = docker compose
IMAGE_NAME = nextjs-app
CONTAINER_NAME = nextjs-container
PORT = 3000
DB_USER = postgres

# Default target: lists all available commands with their descriptions
# .PHONY ensures these targets run as command shortcuts and won't break 
# if a file or folder shares the same name.

.PHONY: help
help:
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-12s - %s\n", $$1, $$2}'

# --- Local Development & Quality (Node/Next.js) ---

.PHONY: install
install: ## Install dependencies using clean install
	npm ci

.PHONY: dev
dev: ## Start Next.js development server locally
	npm run dev

.PHONY: build
build: ## Build the Next.js application for production
	npm run build

.PHONY: start
start: ## Start production server locally
	npm run start

.PHONY: lint
lint: ## Run ESLint check
	npm run lint

.PHONY: lint-fix
lint-fix: ## Fix linting issues automatically
	npm run lint -- --fix

.PHONY: format
format: ## Format code with Prettier
	npx prettier --write .

# --- Docker Compose Commands ---

.PHONY: up
up: ## Start all services
	$(COMPOSE) up -d
up-build:
	$(COMPOSE) up -d --build

.PHONY: down
down: ## Stop services
	$(COMPOSE) down

down-clean: ## Stop services and clean leftover container (older version)
	$(COMPOSE) down --remove-orphans

.PHONY: logs
logs: ## Follow logs (make logs s=app)
	@if [ -n "$(s)" ]; then \
		$(COMPOSE) logs -f --tail=100 $(s); \
	else \
		$(COMPOSE) logs -f --tail=100; \
	fi

.PHONY: shell
shell: ## Open shell in container (make shell s=db)
	$(COMPOSE) exec -it $(or $(s),app) sh

.PHONY: rebuild
rebuild: ## Rebuild without cache
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d --force-recreate

.PHONY: ps
ps: ## Show running containers
	$(COMPOSE) ps

.PHONY: clean
clean: ## Remove containers + volumes + system prune
	$(COMPOSE) down -v --remove-orphans
	docker system prune -f
	docker rmi $(IMAGE_NAME) || true

# --- Database Management ---

.PHONY: db-init
db-init: db-migrate db-seed ## Run migrations and seed data

.PHONY: db-migrate
db-migrate: ## Run migrations only
	./scripts/db/init.sh --migrate-only

.PHONY: db-seed
db-seed: ## Seed database
	./scripts/db/seed.sh

.PHONY: db-backup
db-backup: ## Create database backup
	./scripts/db/backup.sh

.PHONY: db-reset
db-reset: ## Drop, recreate, and seed database
	./scripts/db/init.sh --force
	./scripts/db/seed.sh

.PHONY: db-shell
db-shell: ## Open database shell (PostgreSQL)
	$(COMPOSE) exec -it postgres psql -U $(DB_USER) -d mydb

# --- Single Container Commands ---

.PHONY: docker-build
docker-build: ## Build a single Docker image
	docker build -t $(IMAGE_NAME) .

.PHONY: docker-run
docker-run: ## Run a single Next.js container
	docker run -d -p $(PORT):$(PORT) --name $(CONTAINER_NAME) $(IMAGE_NAME)

.PHONY: docker-stop
docker-stop: ## Stop the single container
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
