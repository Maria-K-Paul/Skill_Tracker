# Skill Leveling Platform

A FastAPI-based backend platform that enables college students to level up their skills by booking and taking self-paced assessments across domain tracks.

## Overview

Students enroll in tracks (domains), progress through levels, and book exam slots independently. An AI engine generates questions from topic/subtopic content. Results drive progression decisions with a built-in skill-gap analysis.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (via SQLAlchemy)
- **Migrations**: Alembic
- **Auth**: JWT (access + refresh tokens)
- **AI**: Pluggable LLM client (see `app/modules/ai_engine/`)
- **Jobs**: Scheduled nightly analytics refresh

## Quick Start

**IMPORTANT**: Before running this project locally, please read [docs/neon_setup.md](docs/neon_setup.md) for the required database setup steps using Neon.

```bash
cp .env.example .env
# Fill in your secrets in .env

pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed initial data (optional)
python scripts/seed_data.py

# Start dev server
uvicorn app.main:app --reload
```

## Project Layout

```
skill-leveling-platform/
├── app/
│   ├── core/          # Config, DB, security, dependencies, exceptions
│   ├── utils/         # Shared utilities
│   └── modules/       # Feature modules (auth, users, domains, exams, …)
├── docs/              # Architecture, API contracts, business rules, DB schema
├── migrations/        # Alembic migration scripts
├── scripts/           # Seed & maintenance scripts
└── tests/             # Integration tests
```

## API Docs

Once running, visit `http://localhost:8000/docs` for the interactive Swagger UI.

## Business Rules

See [docs/business_rules.md](docs/business_rules.md) for the full ruleset.

## CODEOWNERS

See [CODEOWNERS](CODEOWNERS) for module ownership assignments.
