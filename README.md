# Go Boilerplate

Production-ready Go backend boilerplate with a Bun/Turbo monorepo for shared API contracts (Zod + OpenAPI) and email templates.

## Overview

This repository contains:

- **Backend (Go + Echo)** in `backend/`
  - HTTP server
  - PostgreSQL connection + migrations
  - Redis + Asynq background jobs
  - Health checks
  - OpenAPI docs UI endpoint
- **TypeScript workspace packages** in `packages/`
  - `@boilerplate/zod` → shared Zod schemas/types
  - `@boilerplate/openapi` → OpenAPI generation from contracts
  - `@boilerplate/emails` → React Email templates + export

---

## Architecture

### Backend flow (runtime)

`cmd/go-boilerplate/main.go` boot sequence:

1. Load config from `.env` and environment variables (`BOILERPLATE_*`)
2. Initialize observability logger (New Relic aware)
3. Run DB migrations automatically when env is **not** `local`
4. Initialize server dependencies:
	- PostgreSQL pool
	- Redis client
	- Asynq worker server
5. Wire repositories → services → handlers → router
6. Start HTTP server with graceful shutdown

### Routes currently available

- `GET /status` → health endpoint (checks DB and Redis)
- `GET /docs` → serves Scalar API reference HTML
- `GET /static/*` → static assets from `backend/static`
- `/api/v1` group is created and ready for feature routes

---

## Prerequisites

- **Go** `1.25.4+` (matches `backend/go.mod`)
- **Bun** `1.2.13+` (matches root `packageManager`)
- **Node.js** `22+`
- **PostgreSQL** (local default: `localhost:5432`)
- **Redis** (local default: `localhost:6379`)
- **Task** CLI (for `backend/Taskfile.yml`)  
  Install: https://taskfile.dev/installation/

Optional:

- Docker (useful for local Postgres/Redis and future integration tests)

---

## Project Structure

```text
.
├─ backend/
│  ├─ cmd/go-boilerplate/main.go
│  ├─ internal/
│  │  ├─ config/          # env + observability config
│  │  ├─ database/        # postgres pool + migrator
│  │  ├─ handler/         # http handlers
│  │  ├─ middleware/      # auth, tracing, rate-limit, request context
│  │  ├─ repository/      # data access layer
│  │  ├─ service/         # business logic layer
│  │  └─ server/          # server dependencies and lifecycle
│  ├─ static/             # docs/static assets (served under /static)
│  └─ templates/emails/   # exported html email templates
├─ packages/
│  ├─ zod/                # schema/types package
│  ├─ openapi/            # openapi contract package
│  └─ emails/             # react email templates + preview/export
├─ package.json           # root turbo scripts
└─ turbo.json             # turbo task config
```

---

## Setup

### 1) Install JavaScript workspace dependencies

```bash
bun install
```

### 2) Install backend dependencies

From `backend/`:

```bash
cd backend
go mod download
```

### 3) Configure backend environment

From `backend/`:

```bash
cp .env.example .env
```

> Important: This project intentionally uses dot-separated env keys (for example `BOILERPLATE_SERVER.PORT`) because config is loaded via Koanf + Godotenv.

### 4) Start required services

You need PostgreSQL + Redis running before starting the backend.

If you want a quick Docker local setup:

```bash
docker run --name boilerplate-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=boilerplate -p 5432:5432 -d postgres:17
docker run --name boilerplate-redis -p 6379:6379 -d redis:7
```

### 5) Run backend

From `backend/`:

```bash
task run
```

or directly:

```bash
go run ./cmd/go-boilerplate
```

Server default URL: `http://localhost:8080`

---

## Main Commands

### Root workspace commands

Run from repository root:

```bash
bun install
bun run dev
bun run build
bun run typecheck
bun run lint
bun run lint:fix
bun run format:check
bun run format:fix
bun run clean
```

### Backend commands

Run from `backend/`:

```bash
go mod download
task help
task run
task dev
task tidy
task migrations:new name=add_users_table
task migrations:up
```

`task migrations:up` expects `BOILERPLATE_DB_DSN` to be set (Task variable consumed by tern):

```bash
export BOILERPLATE_DB_DSN='postgres://postgres:postgres@localhost:5432/boilerplate?sslmode=disable'
task migrations:up
```

### Package commands (individual)

#### Zod package

```bash
cd packages/zod
bun run dev
bun run build
bun run clean
```

#### OpenAPI package

```bash
cd packages/openapi
bun run dev
bun run build
bun run gen
bun run clean
```

#### Emails package

```bash
cd packages/emails
bun run dev        # React Email preview on :3001
bun run typecheck
bun run export     # exports HTML to backend/templates/emails
bun run build
```

### Useful one-liners with Bun filters

From repository root:

```bash
bun run --filter @boilerplate/zod build
bun run --filter @boilerplate/openapi gen
bun run --filter @boilerplate/emails dev
```

---

## Testing

```bash
# Run backend tests
cd backend
go test ./...

# Run with coverage
go test -cover ./...

# Run integration tests (requires Docker)
go test -tags=integration ./...
```

---

## OpenAPI Docs Workflow

Backend docs UI is served at:

- `http://localhost:8080/docs`

The HTML viewer (`backend/static/openapi.html`) loads spec from:

- `/static/openapi.json`

Recommended refresh flow:

```bash
cd packages/openapi
bun run gen
cp openapi.json ../../backend/static/openapi.json
```

Then restart backend (if needed) and open `/docs`.

---

## Environment Variables (backend)

The backend uses keys from `backend/.env.example`.

The backend uses environment variables prefixed with `BOILERPLATE_`. Key variables include:

- `BOILERPLATE_DATABASE_*` - PostgreSQL connection settings
- `BOILERPLATE_SERVER_*` - Server configuration
- `BOILERPLATE_AUTH_*` - Authentication settings
- `BOILERPLATE_REDIS_*` - Redis connection
- `BOILERPLATE_EMAIL_*` - Email service configuration
- `BOILERPLATE_OBSERVABILITY_*` - Monitoring settings


Core app:

```dotenv
BOILERPLATE_PRIMARY.ENV="local"

BOILERPLATE_SERVER.PORT="8080"
BOILERPLATE_SERVER.READ_TIMEOUT="30"
BOILERPLATE_SERVER.WRITE_TIMEOUT="30"
BOILERPLATE_SERVER.IDLE_TIMEOUT="60"
BOILERPLATE_SERVER.CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Database:

```dotenv
BOILERPLATE_DATABASE.HOST="localhost"
BOILERPLATE_DATABASE.PORT="5432"
BOILERPLATE_DATABASE.USER="postgres"
BOILERPLATE_DATABASE.PASSWORD="postgres"
BOILERPLATE_DATABASE.NAME="boilerplate"
BOILERPLATE_DATABASE.SSL_MODE="disable"
BOILERPLATE_DATABASE.MAX_OPEN_CONNS="25"
BOILERPLATE_DATABASE.MAX_IDLE_CONNS="25"
BOILERPLATE_DATABASE.CONN_MAX_LIFETIME="300"
BOILERPLATE_DATABASE.CONN_MAX_IDLE_TIME="300"
```

Auth / Integration / Redis:

```dotenv
BOILERPLATE_AUTH.SECRET_KEY="secret"
BOILERPLATE_INTEGRATION.RESEND_API_KEY="resend_key"
BOILERPLATE_REDIS.ADDRESS="localhost:6379"
```

Observability:

```dotenv
BOILERPLATE_OBSERVABILITY.SERVICE_NAME="boilerplate"
BOILERPLATE_OBSERVABILITY.ENVIRONMENT="development"
BOILERPLATE_OBSERVABILITY.LOGGING.LEVEL="debug"
BOILERPLATE_OBSERVABILITY.LOGGING.FORMAT="console"
BOILERPLATE_OBSERVABILITY.LOGGING.SLOW_QUERY_THRESHOLD="100ms"
BOILERPLATE_OBSERVABILITY.NEW_RELIC.LICENSE_KEY="<new-relic-license>"
BOILERPLATE_OBSERVABILITY.NEW_RELIC.APP_LOG_FORWARDING_ENABLED="true"
BOILERPLATE_OBSERVABILITY.NEW_RELIC.DISTRIBUTED_TRACING_ENABLED="true"
BOILERPLATE_OBSERVABILITY.NEW_RELIC.DEBUG_LOGGING="false"
BOILERPLATE_OBSERVABILITY.HEALTH_CHECKS.ENABLED="true"
BOILERPLATE_OBSERVABILITY.HEALTH_CHECKS.INTERVAL="30s"
BOILERPLATE_OBSERVABILITY.HEALTH_CHECKS.TIMEOUT="5s"
BOILERPLATE_OBSERVABILITY.HEALTH_CHECKS.CHECKS="database,redis"
```

---

## Architecture

This boilerplate follows clean architecture principles:

- **Handlers**: HTTP request/response handling
- **Services**: Business logic implementation
- **Repositories**: Data access layer
- **Models**: Domain entities
- **Infrastructure**: External services (database, cache, email)


## Local Development Workflow (recommended)

1. Start PostgreSQL and Redis
2. Start backend:

	```bash
	cd backend
	task run
	```

3. In another terminal, start package dev flows as needed:

	```bash
	bun run --filter @boilerplate/zod dev
	bun run --filter @boilerplate/openapi dev
	bun run --filter @boilerplate/emails dev
	```

4. Verify backend health:

	```bash
	curl http://localhost:8080/status
	```

5. Open docs:

	- `http://localhost:8080/docs`

---

## Production Considerations

1. Use environment-specific configuration
2. Enable production logging levels
3. Configure proper database connection pooling
4. Set up monitoring and alerting
5. Use a reverse proxy (nginx, Caddy)
6. Enable rate limiting and security headers
7. Configure CORS for your domains

---

## Troubleshooting

- `task: command not found` → install Task CLI from taskfile.dev
- Backend exits on startup → verify Postgres/Redis are reachable and `.env` values are correct
- `/docs` loads but spec missing → generate/copy `openapi.json` to `backend/static/openapi.json`
- Root `bun run dev` fails early → run package dev scripts individually to isolate the failing package

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.