# Neon Database Setup and Workflow

We use Neon (serverless PostgreSQL) for our database. Neon gives us branching capabilities, which means every developer can have their own isolated database for local testing, completely free of conflict with the rest of the team.

Because Neon uses PgBouncer for connection pooling (which is great for FastAPI but incompatible with some Alembic migration features), our setup uses **two** connection strings.

## Team Branching Workflow

Follow these steps exactly to set up your local development environment:

1. **Project Setup (One-time, already done)**
   One person has created the Neon project and the `main` branch. This branch serves as our staging/shared-dev environment.

2. **Create Your Personal Branch**
   Each developer must create their OWN Neon branch off `main` for local development. 
   - Neon branches are instant, copy-on-write, and free within plan limits.
   - Name your branch descriptively, e.g., `dev/alice` or `dev/bob`. 
   - This ensures your local testing (including destructive migration testing) does not affect anyone else's data.
   - **How to do this**: In the Neon dashboard, go to **Branches** -> **New Branch**. Set `main` as the parent.

3. **Update Your `.env`**
   Get the connection strings for your specific branch and place them in your personal `.env` file (which should never be committed, it is ignored by git).
   
   You need two connection strings:
   - **Pooled connection string**: Used by the running FastAPI app.
   - **Direct connection string**: Used ONLY by Alembic migrations and seed scripts.
   
   **How to get them**:
   - In the Neon Dashboard, select your branch and go to **Connection Details**.
   - Get the string with "Pooled connection" enabled, and paste it into `DATABASE_URL`.
   - Get the string with "Pooled connection" disabled, and paste it into `DATABASE_URL_DIRECT`.
   - **Important**: Replace the `postgres://` prefix with `postgresql+asyncpg://` in both URLs.

4. **Running Migrations**
   Before opening a Pull Request, always run Alembic migrations locally against your own branch to confirm they apply cleanly:
   ```bash
   alembic upgrade head
   ```

5. **Syncing with Main**
   Periodically, or before merging your PR to `main`, reset your dev branch back to `main`'s current state to avoid drift.
   - **How to do this**: In the Neon dashboard, use the "Reset branch from parent" feature on your branch.

6. **CI/CD**
   CI/CD pipelines should always use a dedicated Neon branch created fresh per run, or a persistent `ci` branch. CI/CD should never run on `main` or a developer's personal branch.
