import asyncio
import os
import sys

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.modules.auth.models import Role, RoleName, UserRole
from app.modules.users.models import User

async def main():
    email = os.environ.get("ADMIN_BOOTSTRAP_EMAIL")
    password = os.environ.get("ADMIN_BOOTSTRAP_PASSWORD")

    if not email or not password:
        print("Error: ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD environment variables must be set.", file=sys.stderr)
        sys.exit(1)

    async with AsyncSessionLocal() as db:
        # Ensure the admin role exists
        admin_role = (await db.scalars(select(Role).where(Role.name == RoleName.ADMIN))).first()
        if not admin_role:
            print("Admin role not found in database. Did you run the migrations/seed script?", file=sys.stderr)
            sys.exit(1)

        # Hash password using the app's real passlib configuration
        hashed_password = await hash_password(password)

        user = (await db.scalars(select(User).where(User.email == email).options(selectinload(User.user_roles)))).first()
        
        if user:
            user.password_hash = hashed_password
            user.must_change_password = False
            user.token_version = 0
            
            has_admin = any(link.role_id == admin_role.id for link in user.user_roles)
            if not has_admin:
                user.user_roles.append(UserRole(role=admin_role))
            print(f"Updated existing user and ensured admin role for {email}")
        else:
            username = email.split('@')[0]
            user = User(
                username=username,
                email=email,
                full_name="Administrator",
                password_hash=hashed_password,
                must_change_password=False,
                token_version=0
            )
            user.user_roles.append(UserRole(role=admin_role))
            db.add(user)
            print(f"Created new admin account for {email}")

        await db.commit()

if __name__ == "__main__":
    asyncio.run(main())
