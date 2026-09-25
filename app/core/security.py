"""
app/core/security.py
--------------------
Security utilities for the platform:
- Password hashing and verification (bcrypt via passlib).
- JWT access token creation and decoding.
- Fernet symmetric encryption for secret codes.

TODO: Implement token blacklisting for logout.
TODO: Add key rotation support for Fernet encryption.
TODO: Add RS256 support for JWT if multi-service auth is needed.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password Hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Return a bcrypt hash of the given plain-text password."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if `plain` matches the stored `hashed` password."""
    return pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────
ALGORITHM = "HS256"


def create_access_token(data: dict[str, Any]) -> str:
    """
    Create a signed JWT access token with a short expiry.

    TODO: Add `jti` (token ID) claim for revocation support.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {**data, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT access token.
    Raises JWTError on invalid or expired tokens.
    """
    # TODO: add token type check ("type" == "access")
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


# ── Secret Code Encryption ────────────────────────────────────────────────────
_fernet = Fernet(settings.code_encryption_key.encode())


def encrypt_code(plain_code: str) -> str:
    """Encrypt a plain-text secret code. Returns base64-encoded ciphertext."""
    return _fernet.encrypt(plain_code.encode()).decode()


def decrypt_code(encrypted_code: str) -> str:
    """
    Decrypt a Fernet-encrypted secret code.
    Only callable in admin context — never expose to student endpoints.
    """
    return _fernet.decrypt(encrypted_code.encode()).decode()
