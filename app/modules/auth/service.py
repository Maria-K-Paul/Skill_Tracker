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


from datetime import datetime, timezone, timedelta
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.modules.users.models import User
from app.modules.auth.models import Role, UserRole, RefreshToken
from app.core.audit import AuditLog
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
import secrets

async def register(db: AsyncSession, email: str, password: str, role_name: str = "student") -> User:
    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    if result.scalars().first():
        raise ValueError("Email already registered")
        
    user = User(
        email=email,
        password_hash=hash_password(password),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Get role
    result = await db.execute(select(Role).where(Role.name == role_name))
    role = result.scalars().first()
    if not role:
        role = Role(name=role_name)
        db.add(role)
        await db.commit()
        await db.refresh(role)

    user_role = UserRole(user_id=user.id, role_id=role.id)
    db.add(user_role)
    await db.commit()

    return user

async def login(db: AsyncSession, email: str, password: str) -> dict:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        raise ValueError("Invalid credentials")

    if not user.is_active:
        raise ValueError("Account is deactivated")

    # verify password
    if not verify_password(password, user.password_hash):
        user.failed_login_count += 1
        if user.failed_login_count >= MAX_ATTEMPTS:
            user.is_active = False
            audit = AuditLog(
                action="LOCKOUT",
                target_user_id=user.id,
                details={"reason": "Max failed logins reached"},
                created_at=datetime.now(timezone.utc)
            )
            db.add(audit)
        await db.commit()
        raise ValueError("Invalid credentials")
        
    # reset failed logins
    if user.failed_login_count > 0:
        user.failed_login_count = 0
        await db.commit()

    # Get user roles
    result = await db.execute(
        select(Role.name).join(UserRole, Role.id == UserRole.role_id).where(UserRole.user_id == user.id)
    )
    roles = result.scalars().all()

    access_token = create_access_token({"sub": str(user.id), "roles": list(roles)})
    refresh_token = await issue_refresh_token(db, user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token.token_hash
    }

async def issue_refresh_token(db: AsyncSession, user_id: int) -> RefreshToken:
    token = secrets.token_urlsafe(32)
    refresh = RefreshToken(
        user_id=user_id,
        token_hash=token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
        created_at=datetime.now(timezone.utc)
    )
    db.add(refresh)
    await db.commit()
    await db.refresh(refresh)
    return refresh

async def rotate_refresh_token(db: AsyncSession, old_token: str) -> dict:
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == old_token, RefreshToken.revoked == False))
    refresh = result.scalars().first()
    
    if not refresh or refresh.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise ValueError("Invalid or expired refresh token")
        
    refresh.revoked = True
    await db.commit()

    # Get user roles
    user_id = refresh.user_id
    result = await db.execute(
        select(Role.name).join(UserRole, Role.id == UserRole.role_id).where(UserRole.user_id == user_id)
    )
    roles = result.scalars().all()

    access_token = create_access_token({"sub": str(user_id), "roles": list(roles)})
    new_refresh = await issue_refresh_token(db, user_id)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh.token_hash
    }

async def check_role(db: AsyncSession, user_id: int, role_name: str) -> bool:
    result = await db.execute(
        select(Role).join(UserRole, Role.id == UserRole.role_id)
        .where(UserRole.user_id == user_id, Role.name == role_name)
    )
    return result.scalars().first() is not None
