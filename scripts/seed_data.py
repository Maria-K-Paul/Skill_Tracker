"""
scripts/seed_data.py
--------------------
Seed script to populate the database with initial reference data for
local development and testing.

Intended to be run once after `alembic upgrade head`.

Usage:
    python scripts/seed_data.py
"""

# TODO: import app/core/database session
# TODO: seed roles (student, admin)
# TODO: seed departments
# TODO: seed academic_years
# TODO: seed sample tracks and levels
# TODO: seed a default admin user


def seed_roles() -> None:
    """Insert default roles into the roles table."""
    # TODO: implement
    pass


def seed_departments() -> None:
    """Insert sample departments."""
    # TODO: implement
    pass


def seed_academic_years() -> None:
    """Insert sample academic year labels."""
    # TODO: implement
    pass


def seed_admin_user() -> None:
    """Create a default admin user for development."""
    # TODO: implement using auth/service.register()
    pass


def main() -> None:
    """Entry point — runs all seed functions in order."""
    print("Seeding database...")
    seed_roles()
    seed_departments()
    seed_academic_years()
    seed_admin_user()
    print("Done.")


if __name__ == "__main__":
    main()
