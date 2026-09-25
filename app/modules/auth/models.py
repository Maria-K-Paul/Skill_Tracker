"""
app/modules/auth/models.py
--------------------------
ORM model placeholders for authentication-related tables.

Tables covered: users, roles, user_roles, refresh_tokens.
Column comments match the canonical schema in docs/db_schema.md exactly.

TODO: Add SQLAlchemy Column definitions during implementation phase.
TODO: Add __repr__ methods for easier debugging.
"""


class User:
    """
    Represents a platform user (student or admin).

    Table: users
        # id: INTEGER (PK)
        # email: VARCHAR
        # password_hash: VARCHAR
        # is_active: BOOLEAN
        # failed_login_count: INTEGER
        # created_at: TIMESTAMP
        # updated_at: TIMESTAMP
    """
    pass


class Role:
    """
    Lookup table for roles. Values: 'student', 'admin'.

    Table: roles
        # id: INTEGER (PK)
        # name: VARCHAR
    """
    pass


class UserRole:
    """
    Many-to-many join between users and roles.

    Table: user_roles
        # id: INTEGER (PK)
        # user_id: INTEGER (FK → users)
        # role_id: INTEGER (FK → roles)
    """
    pass


class RefreshToken:
    """
    Stores hashed refresh tokens for JWT rotation.

    Table: refresh_tokens
        # id: INTEGER (PK)
        # user_id: INTEGER (FK → users)
        # token_hash: VARCHAR
        # expires_at: TIMESTAMP
        # revoked: BOOLEAN
        # created_at: TIMESTAMP
    """
    pass
