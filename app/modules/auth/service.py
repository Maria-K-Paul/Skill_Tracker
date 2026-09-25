"""
app/modules/auth/service.py
---------------------------
Business logic for authentication and authorization.

Cross-module calls: writes to core/audit.py AuditLog on lockout events.
Does NOT import from other modules' models.py or router.py.

TODO: implement register(email, password, role) → User
TODO: implement login(email, password) → (access_token, refresh_token)
      - verify password
      - reset failed_login_count on success
      - increment failed_login_count on failure
      - lock account after MAX_FAILED_LOGINS (write to audit_log)
TODO: implement issue_refresh_token(user_id) → RefreshToken
TODO: implement rotate_refresh_token(old_token) → new RefreshToken (revoke old)
TODO: implement check_role(user_id, role_name) → bool
TODO: implement get_user_by_email(email) → User | None
"""

from app.core.constants import MAX_ATTEMPTS  # noqa: F401 — available for reference


async def register(email: str, password: str, role: str = "student") -> None:
    """
    Register a new user and assign the given role.

    TODO: hash password, insert User, insert UserRole.
    """
    pass


async def login(email: str, password: str) -> dict:
    """
    Authenticate a user and return tokens.

    TODO: fetch user, verify password, issue tokens, write audit on lockout.
    """
    pass


async def rotate_refresh_token(old_token: str) -> dict:
    """
    Revoke the provided refresh token and issue a new one.

    TODO: verify token hash, revoke, insert new RefreshToken.
    """
    pass


async def check_role(user_id: int, role_name: str) -> bool:
    """Return True if the user holds the given role."""
    # TODO: query user_roles join roles
    return False
